import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'Mock_Payment'
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ transactionId: 1 });

export default mongoose.model('Payment', paymentSchema);

