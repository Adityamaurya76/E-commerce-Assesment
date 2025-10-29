import express from 'express';
const router = express.Router();
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { validate, validateQuery, productSchema, productUpdateSchema, paginationSchema } from '../middleware/validation.js';

router.get('/', validateQuery(paginationSchema), getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, authorizeAdmin, validate(productSchema), createProduct);
router.put('/:id', authenticate, authorizeAdmin, validate(productUpdateSchema), updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;

