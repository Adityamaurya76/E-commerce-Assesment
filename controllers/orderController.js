import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { emailQueue } from '../services/emailService.js';

const checkout = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {

      const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
      
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      let totalAmount = 0;
      const orderItems = [];

      for (const cartItem of cart.items) {
        const product = cartItem.productId;

        if (product.availableStock < cartItem.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
        await product.reserveStock(cartItem.quantity);
        const itemTotal = product.price * cartItem.quantity;
        totalAmount += itemTotal;
        orderItems.push({productId: product._id, quantity: cartItem.quantity, priceAtPurchase: product.price});
      }

      const order = await Order.create([{userId: req.user._id, items: orderItems, totalAmount, status: 'payment_pending'}], { session });
      await cart.clearCart();

      res.status(201).json({success: true, message: 'Order created successfully. Please complete payment within 15 minutes.', data: {order: order[0], paymentExpiresAt: order[0].paymentExpiresAt}});
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
});

const processPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
     
      const order = await Order.findById(id).populate('items.productId');
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.userId.toString() !== req.user._id.toString()) {
        throw new Error('Unauthorized access to order');
      }

      if (order.status !== 'PENDING_PAYMENT') {
        throw new Error('Order is not in pending payment status');
      }

      if (order.isPaymentExpired()) {
        order.status = 'Cancalled';
        await order.save({ session });

        for (const orderItem of order.items) {
          const product = orderItem.productId;
          await product.releaseReservedStock(orderItem.quantity);
        }

        throw new Error('Payment has expired. Order has been cancelled.');
      }

      // Mock payment processing
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const paymentSuccess = Math.random() > 0.1;

      if (paymentSuccess) {
        await Payment.create([{orderId: order._id, transactionId, amount: order.totalAmount,status: 'Success'}], { session });
        order.status = 'Paid';
        await order.save({ session });

        for (const orderItem of order.items) {
          const product = orderItem.productId;
          await product.confirmStockDeduction(orderItem.quantity);
        }

        // Queue email notification
        await emailQueue.add('send-order-confirmation', {
          orderId: order._id,
          userId: order.userId,
          totalAmount: order.totalAmount
        });

        res.json({success: true, message: 'Payment processed successfully', data: {order, payment: {transactionId, amount: order.totalAmount, status: 'Success'}}});
      } else {
        // Payment failed
        await Payment.create([{orderId: order._id, transactionId, amount: order.totalAmount, status: 'Failed'}], { session });

        // Cancel order and release stock
        order.status = 'Cancelled';
        await order.save({ session });

        // Release reserved stock
        for (const orderItem of order.items) {
          const product = orderItem.productId;
          await product.releaseReservedStock(orderItem.quantity);
        }

        res.status(400).json({success: false, message: 'Payment failed. Order has been cancelled.', data: {order, payment: {transactionId, amount: order.totalAmount, status: 'Failed'}}});
      }
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ userId: req.user._id }).populate('items.productId', 'name price').sort(sort).skip(skip).limit(limit).lean();
  const total = await Order.countDocuments({ userId: req.user._id });

  res.json({success: true, data: {orders, pagination: {currentPage: page, totalPages: Math.ceil(total / limit), totalOrders: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1}}});
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.productId', 'name price description');

  if (!order) {

    return res.status(404).json({success: false, message: 'Order not found'});
  }

  if (order.userId.toString() !== req.user._id.toString()) {

    return res.status(403).json({success: false, message: 'Unauthorized access to order'});
  }

  // Get payment information if order is paid
  let payment = null;
  if (order.status === 'Paid') {
    payment = await Payment.findOne({ orderId: order._id });
  }

  res.json({success: true, data: {order, payment}});
});

export {
  checkout,
  processPayment,
  getUserOrders,
  getOrder
};

