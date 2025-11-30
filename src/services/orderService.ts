import supabase from '../config/database';
import {
    Order,
    OrderWithItems,
    OrderItem,
    CreateOrderRequest,
    CreateOrderResponse,
} from '../types/order.types';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import productService from './productService';

/**
 * Order Service
 * Handles all order-related business logic
 */
class OrderService {
    /**
     * Generate unique order ID
     */
    private generateOrderId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    /**
     * Create new order
     */
    async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        try {
            const orderId = this.generateOrderId();
            const { customerInfo, items } = request;

            // Validate and fetch product details
            const orderItems: OrderItem[] = [];
            let totalAmount = 0;

            for (const item of items) {
                const product = await productService.getProductById(item.productId);

                if (!product) {
                    throw new ApiError(`Product not found: ${item.productId}`, 404);
                }

                if (product.stock < item.quantity) {
                    throw new ApiError(
                        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                        400
                    );
                }

                const subtotal = product.price * item.quantity;
                totalAmount += subtotal;

                orderItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    product_price: product.price,
                    quantity: item.quantity,
                    subtotal,
                });
            }

            // Create order in database
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    id: orderId,
                    customer_name: customerInfo.name,
                    customer_email: customerInfo.email,
                    customer_phone: customerInfo.phone,
                    customer_address: customerInfo.address,
                    total_amount: totalAmount,
                    payment_status: 'pending',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItemsWithOrderId = orderItems.map(item => ({
                ...item,
                order_id: orderId,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsWithOrderId);

            if (itemsError) {
                // Rollback: delete order if items insert fails
                await supabase.from('orders').delete().eq('id', orderId);
                throw itemsError;
            }

            logger.success(`Order created successfully: ${orderId}`);

            return {
                orderId,
                totalAmount,
                createdAt: orderData.created_at,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            logger.error('Failed to create order:', error);
            throw new ApiError('Failed to create order', 500);
        }
    }

    /**
     * Get order by ID with items
     */
    async getOrderById(orderId: string): Promise<OrderWithItems> {
        try {
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (orderError || !orderData) {
                throw new ApiError('Order not found', 404);
            }

            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            return {
                ...orderData,
                items: itemsData || [],
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            logger.error('Failed to get order:', error);
            throw new ApiError('Failed to retrieve order', 500);
        }
    }

    /**
     * Update order payment status
     */
    async updatePaymentStatus(
        orderId: string,
        paymentStatus: string,
        transactionId?: string
    ): Promise<void> {
        try {
            const updateData: any = {
                payment_status: paymentStatus,
                updated_at: new Date().toISOString(),
            };

            if (transactionId) {
                updateData.midtrans_transaction_id = transactionId;
            }

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (error) throw error;

            logger.success(`Order ${orderId} payment status updated to: ${paymentStatus}`);
        } catch (error) {
            logger.error('Failed to update payment status:', error);
            throw new ApiError('Failed to update payment status', 500);
        }
    }
}

export default new OrderService();
