// Payment Types
export interface CreateTransactionRequest {
    orderId: string;
}

export interface CreateTransactionResponse {
    token: string;
    redirectUrl: string;
}

export interface PaymentStatusResponse {
    orderId: string;
    paymentStatus: string;
    transactionStatus: string;
    paidAt?: string;
}

export interface MidtransNotification {
    transaction_time: string;
    transaction_status: string;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status: string;
    currency: string;
}

export type TransactionStatus =
    | 'capture'
    | 'settlement'
    | 'pending'
    | 'deny'
    | 'cancel'
    | 'expire'
    | 'failure';
