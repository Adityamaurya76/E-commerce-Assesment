import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const getCart = asyncHandler(async (req, res) => {

  let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
  }

  res.json({success: true, data: { cart }});
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) {

    return res.status(404).json({success: false, message: 'Product not found'});
  }
  if (product.availableStock < quantity) {

    return res.status(400).json({success: false, message: 'Insufficient stock available'});
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
  }
  await cart.addItem(productId, quantity);

  await cart.populate('items.productId');

  res.json({success: true, message: 'Item added to cart successfully', data: { cart }});
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) {

    return res.status(404).json({success: false, message: 'Product not found'});
  }

  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {

    return res.status(404).json({success: false, message: 'Cart not found'});
  }

  const cartItem = cart.items.find(item => item.productId.toString() === productId);

  if (!cartItem) {

    return res.status(404).json({success: false, message: 'Item not found in cart'});
  }

  if (quantity > cartItem.quantity && product.availableStock < (quantity - cartItem.quantity)) {

    return res.status(400).json({success: false, message: 'Insufficient stock available'});
  }
  await cart.updateItemQuantity(productId, quantity);

  await cart.populate('items.productId');

  res.json({success: true, message: 'Cart item updated successfully', data: { cart }});
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {

    return res.status(404).json({success: false, message: 'Cart not found'});
  }

  const cartItem = cart.items.find(item => item.productId.toString() === productId);

  if (!cartItem) {

    return res.status(404).json({success: false, message: 'Item not found in cart'});
  }
  await cart.removeItem(productId);

  await cart.populate('items.productId');

  res.json({success: true, message: 'Item removed from cart successfully', data: { cart }});
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    return res.status(404).json({success: false, message: 'Cart not found'});
  }
  await cart.clearCart();

  res.json({success: true, message: 'Cart cleared successfully', data: { cart }});
});

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

