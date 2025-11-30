import { Router } from 'express';
import productController from '../controllers/productController';

const router = Router();

/**
 * Product Routes
 */

// GET /api/v1/categories
router.get('/categories', productController.getCategories);

// GET /api/v1/products
router.get('/products', productController.getProducts);

// GET /api/v1/products/:id
router.get('/products/:id', productController.getProductById);

export default router;
