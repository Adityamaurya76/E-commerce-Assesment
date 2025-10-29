import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const processExpiredOrders = async () => {
  try {
    const expiredOrders = await Order.find({
      status: 'PENDING_PAYMENT',
      paymentExpiresAt: { $lt: new Date() }
    }).populate('items.productId');

    if (expiredOrders.length === 0) {
      console.log('No expired orders found');

      return;
    }

    for (const order of expiredOrders) {
      try {
        order.status = 'Cancelled';
        await order.save();

        for (const orderItem of order.items) {
          const product = orderItem.productId;
          await product.releaseReservedStock(orderItem.quantity);
        }
        console.log(`Order ${order._id} cancelled and stock released`);
      } catch (error) {
        console.error(`Error processing expired order ${order._id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in processExpiredOrders:', error.message);
  }
};

const startExpiredOrderProcessor = () => {
  cron.schedule('expire schedule', processExpiredOrders);
};

export {
  processExpiredOrders,
  startExpiredOrderProcessor
};

