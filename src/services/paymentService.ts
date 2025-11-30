import { snap, coreApi, verifySignature } from '../config/midtrans';
import orderService from './orderService';
import productService from './productService';
import {
    CreateTransactionRequest,
    CreateTransactionResponse,
    PaymentStatusResponse,
    MidtransNotification,

} from '../types/payment.types';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Payment Service
 * Handles Midtrans payment integration
 */
class PaymentService {
    /**
     * Create Midtrans transaction (generate Snap token)
     * This is called when user initiates payment
     */
    async createTransaction(
        request: CreateTransactionRequest
    ): Promise<CreateTransactionResponse> {
        try {
            const { orderId } = request;

            // Get order details
            const order = await orderService.getOrderById(orderId);

            if (!order) {
                throw new ApiError('Order not found', 404);
            }

            if (order.payment_status === 'success') {
                throw new ApiError('Order already paid', 400);
            }

            // Prepare Midtrans transaction parameters
            const parameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: order.total_amount,
                },
                customer_details: {
                    first_name: order.customer_name,
                    email: order.customer_email,
                    phone: order.customer_phone,
                },
                item_details: order.items.map(item => ({
                    id: item.product_id,
                    price: item.product_price,
                    quantity: item.quantity,
                    name: item.product_name,
                })),
            };

            logger.info('Creating Midtrans transaction for order:', orderId);

            // Create transaction with Midtrans
            const transaction = await snap.createTransaction(parameter);

            logger.success('Midtrans transaction created:', transaction.token);

            return {
                token: transaction.token,
                redirectUrl: transaction.redirect_url,
            };
        } catch (error: any) {
            if (error instanceof ApiError) throw error;
            logger.error('Failed to create Midtrans transaction:', error);
            throw new ApiError(
                error.message || 'Failed to create payment transaction',
                500
            );
        }
    }

    /**
     * Handle Midtrans notification (webhook)
     * Called by Midtrans when payment status changes
     */
    async handleNotification(notification: MidtransNotification): Promise<void> {
        try {
            const {
                order_id,
                transaction_status,
                fraud_status,
                signature_key,
                status_code,
                gross_amount,
                transaction_id,
            } = notification;

            logger.info('Received Midtrans notification for order:', order_id);
            logger.debug('Notification details:', notification);

            // Verify signature for security
            const isValid = verifySignature(
                order_id,
                status_code,
                gross_amount,
                signature_key
            );

            if (!isValid) {
                logger.error('Invalid Midtrans signature for order:', order_id);
                throw new ApiError('Invalid notification signature', 403);
            }

            // Map transaction status to payment status
            let paymentStatus = 'pending';

            if (transaction_status === 'capture') {
                paymentStatus = fraud_status === 'accept' ? 'success' : 'pending';
            } else if (transaction_status === 'settlement') {
                paymentStatus = 'success';
            } else if (
                transaction_status === 'cancel' ||
                transaction_status === 'deny' ||
                transaction_status === 'expire'
            ) {
                paymentStatus = 'failed';
            } else if (transaction_status === 'pending') {
                paymentStatus = 'pending';
            }

            // Update order payment status
            await orderService.updatePaymentStatus(
                order_id,
                paymentStatus,
                transaction_id
            );

            // If payment is successful, update product stock
            if (paymentStatus === 'success') {
                const order = await orderService.getOrderById(order_id);
                for (const item of order.items) {
                    await productService.updateStock(item.product_id, item.quantity);
                }
                logger.success(`Stock updated for order: ${order_id}`);
            }

            logger.success(
                `Payment notification processed: ${order_id} -> ${paymentStatus}`
            );
        } catch (error) {
            if (error instanceof ApiError) throw error;
            logger.error('Failed to handle notification:', error);
            throw new ApiError('Failed to process payment notification', 500);
        }
    }

    /**
     * Check payment status from Midtrans
     */
    async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
        try {
            const order = await orderService.getOrderById(orderId);

            if (!order) {
                throw new ApiError('Order not found', 404);
            }

            // Get transaction status from Midtrans
            const status = await (coreApi as any).transaction.status(orderId);

            logger.debug('Midtrans status response:', status);

            // Map Midtrans transaction status to payment status
            let newPaymentStatus = 'pending';
            const transactionStatus = status.transaction_status;

            if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
                newPaymentStatus = 'success';
            } else if (
                transactionStatus === 'cancel' ||
                transactionStatus === 'deny' ||
                transactionStatus === 'expire'
            ) {
                newPaymentStatus = 'failed';
            }

            // Update order status if it changed AND update stock if payment is successful
            if (order.payment_status !== newPaymentStatus) {
                await orderService.updatePaymentStatus(
                    orderId,
                    newPaymentStatus,
                    status.transaction_id
                );

                // Update stock ONLY when payment becomes successful (not already successful)
                if (newPaymentStatus === 'success') {
                    logger.info(`Payment successful, updating stock for order: ${orderId}`);
                    for (const item of order.items) {
                        await productService.updateStock(item.product_id, item.quantity);
                    }
                    logger.success(`Stock updated successfully for order: ${orderId}`);
                }
            }

            return {
                orderId,
                paymentStatus: newPaymentStatus,
                transactionStatus: status.transaction_status,
                paidAt: status.settlement_time || undefined,
            };
        } catch (error: any) {
            if (error instanceof ApiError) throw error;
            logger.error('Failed to check payment status:', error);
            throw new ApiError(
                error.message || 'Failed to check payment status',
                500
            );
        }
    }
}

export default new PaymentService();
