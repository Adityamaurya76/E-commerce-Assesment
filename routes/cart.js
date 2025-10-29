import express from 'express';
const router = express.Router();
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { authenticate, authorizeUser } from '../middleware/auth.js';
import { validate, cartItemSchema } from '../middleware/validation.js';

router.get('/', authenticate, authorizeUser, getCart);
router.post('/items', authenticate, authorizeUser, validate(cartItemSchema), addToCart);
router.put('/items/:productId', authenticate, authorizeUser, updateCartItem);
router.delete('/items/:productId', authenticate, authorizeUser, removeFromCart);
router.delete('/', authenticate, authorizeUser, clearCart);

export default router;

