import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/errorHandler.js';


const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, sort, status } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query).populate('userId', 'name email').populate('items.productId', 'name price').sort(sort).skip(skip).limit(limit).lean();

  const total = await Order.countDocuments(query);

  res.json({success: true, data: {orders, pagination: {currentPage: page, totalPages: Math.ceil(total / limit), totalOrders: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1}}
  });
});


const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('userId', 'name email').populate('items.productId', 'name price description');

  if (!order) {
    return res.status(404).json({success: false, message: 'Order not found'});
  }

  // Get payment information
  const payment = await Payment.findOne({ orderId: order._id });

  res.json({success: true, data: {order, payment}});
});


const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {

    return res.status(404).json({success: false, message: 'Order not found'});
  }
  try {
    await order.updateStatus(status);
    
    res.json({success: true, message: 'Order status updated successfully',data: { order }});
  } catch (error) {

    return res.status(400).json({success: false, message: error.message});
  }
});


const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { status: { $in: ['PAID', 'SHIPPED', 'DELIVERED'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  res.json({success: true, data: {statusBreakdown: stats, totalOrders, totalRevenue: totalRevenue[0]?.total || 0 }});
});

export {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
};

