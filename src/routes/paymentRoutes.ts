import { Router } from 'express';
import { z } from 'zod';
import paymentController from '../controllers/paymentController';
import { validate } from '../middleware/validator';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Validation schema for creating transaction
 */
const createTransactionSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
});

/**
 * Payment Routes
 */

// POST /api/v1/payment/create-transaction
router.post(
    '/payment/create-transaction',
    paymentLimiter,
    validate(createTransactionSchema),
    paymentController.createTransaction
);

// POST /api/v1/payment/notification
// Midtrans webhook - no validation needed as it comes from Midtrans
router.post('/payment/notification', paymentController.handleNotification);

// GET /api/v1/payment/status/:orderId
router.get('/payment/status/:orderId', paymentController.getPaymentStatus);

export default router;
