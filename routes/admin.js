import express from 'express';
const router = express.Router();
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
} from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import {validate, validateQuery, orderStatusUpdateSchema, orderQuerySchema} from '../middleware/validation.js';

router.get('/orders', authenticate, authorizeAdmin, validateQuery(orderQuerySchema), getAllOrders);

router.get('/orders/stats', authenticate, authorizeAdmin, getOrderStats);
router.get('/orders/:id', authenticate, authorizeAdmin, getOrderById);
router.patch('/orders/:id/status', authenticate, authorizeAdmin, validate(orderStatusUpdateSchema), updateOrderStatus);

export default router;

