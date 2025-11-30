import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/paymentService';
import { successResponse } from '../utils/response';
import { CreateTransactionRequest, MidtransNotification } from '../types/payment.types';
import { logger } from '../utils/logger';

/**
 * Payment Controller
 * Handles HTTP requests for payment endpoints
 */
class PaymentController {
    /**
     * POST /api/v1/payment/create-transaction
     */
    async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request: CreateTransactionRequest = req.body;
            const result = await paymentService.createTransaction(request);
            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/payment/notification
     * Webhook endpoint for Midtrans notifications
     */
    async handleNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const notification: MidtransNotification = req.body;

            logger.info('Midtrans notification received:', notification.order_id);

            await paymentService.handleNotification(notification);

            // Always return 200 to Midtrans to acknowledge receipt
            res.json(successResponse({ message: 'Notification processed successfully' }));
        } catch (error) {
            logger.error('Failed to process Midtrans notification:', error);
            // Still return 200 to prevent Midtrans from retrying
            res.json(successResponse({ message: 'Notification received' }));
        }
    }

    /**
     * GET /api/v1/payment/status/:orderId
     */
    async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { orderId } = req.params;
            const status = await paymentService.checkPaymentStatus(orderId);
            res.json(successResponse(status));
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentController();
