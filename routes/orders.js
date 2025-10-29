import express from 'express';
const router = express.Router();
import {checkout, processPayment, getUserOrders, getOrder} from '../controllers/orderController.js';
import { authenticate, authorizeUser } from '../middleware/auth.js';
import { validateQuery, paginationSchema } from '../middleware/validation.js';

router.post('/checkout', authenticate, authorizeUser, checkout);
router.post('/:id/pay', authenticate, authorizeUser, processPayment);
router.get('/', authenticate, authorizeUser, validateQuery(paginationSchema), getUserOrders);
router.get('/:id', authenticate, authorizeUser, getOrder);

export default router;

