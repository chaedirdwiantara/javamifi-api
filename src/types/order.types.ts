// Order Types
export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface OrderItem {
    id?: string;
    order_id?: string;
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    created_at?: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'expired';

export interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    total_amount: number;
    payment_status: PaymentStatus;
    midtrans_transaction_id?: string;
    midtrans_order_id?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

export interface CreateOrderRequest {
    customerInfo: CustomerInfo;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
}

export interface CreateOrderResponse {
    orderId: string;
    totalAmount: number;
    createdAt: string;
}
