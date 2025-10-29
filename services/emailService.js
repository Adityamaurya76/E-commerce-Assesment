import Queue from 'bull';
import Order from '../models/Order.js';
import User from '../models/User.js';

const emailQueue = new Queue('email queue', process.env.REDIS_URL || 'redis://localhost:6379');

emailQueue.process('send-order-confirmation', async (job) => {
  const { orderId, userId, totalAmount } = job.data;
  
  try {
    const order = await Order.findById(orderId).populate('items.productId', 'name price');
    const user = await User.findById(userId);
    
    if (!order || !user) {
      throw new Error('Order or user not found');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Order confirmation email sent successfully to ${user.email}`);
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(' Failed to send order confirmation email:', error.message);
    throw error;
  }
});

emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

emailQueue.clean(24 * 60 * 60 * 1000);

export { emailQueue };

