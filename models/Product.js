import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: [0, 'Reserved stock cannot be negative']
  },
  availableStock: {
    type: Number,
    default: function() {
      return this.stock - this.reservedStock;
    }
  }
}, {
  timestamps: true
});

productSchema.virtual('availableStock').get(function() {
  return this.stock - this.reservedStock;
});

productSchema.set('toJSON', { virtuals: true });

productSchema.methods.reserveStock = function(quantity) {
  if (this.availableStock < quantity) {
    throw new Error('Insufficient stock available');
  }
  this.reservedStock += quantity;
  return this.save();
};

productSchema.methods.releaseReservedStock = function(quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  return this.save();
};

productSchema.methods.confirmStockDeduction = function(quantity) {
  this.stock -= quantity;
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  return this.save();
};

export default mongoose.model('Product', productSchema);

