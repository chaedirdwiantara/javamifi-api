import { Router } from 'express';
import { z } from 'zod';
import orderController from '../controllers/orderController';
import { validate } from '../middleware/validator';

const router = Router();

/**
 * Validation schema for creating order
 */
const createOrderSchema = z.object({
    customerInfo: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        phone: z.string().min(10, 'Invalid phone number'),
        address: z.string().min(10, 'Address is required'),
    }),
    items: z.array(
        z.object({
            productId: z.string().uuid('Invalid product ID'),
            quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
    ).min(1, 'At least one item is required'),
});

/**
 * Order Routes
 */

// POST /api/v1/orders
router.post('/orders', validate(createOrderSchema), orderController.createOrder);

// GET /api/v1/orders/:orderId
router.get('/orders/:orderId', orderController.getOrder);

export default router;
