import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, sort, search } = req.query;
  const skip = (page - 1) * limit;
  let query = {};

  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };
  }
  const products = await Product.find(query).sort(sort).skip(skip).limit(limit).lean();
  const total = await Product.countDocuments(query);

  res.json({success: true, data: {products, pagination: {currentPage: page, totalPages: Math.ceil(total / limit), totalProducts: total, hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1}}});
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {

    return res.status(404).json({success: false,message: 'Product not found'});
  }

  res.json({success: true, data: { product }});
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({success: true, message: 'Product created successfully', data: { product }});
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {

    return res.status(404).json({success: false, message: 'Product not found'});
  }

  res.json({success: true, message: 'Product updated successfully', data: { product }});
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {

    return res.status(404).json({success: false, message: 'Product not found'});
  }
  await product.deleteOne();

  res.json({success: true, message: 'Product deleted successfully'});
});

export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};

