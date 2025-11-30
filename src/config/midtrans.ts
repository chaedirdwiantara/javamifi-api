import midtransClient from 'midtrans-client';
import { env } from './env';

// Initialize Snap API client
export const snap = new midtransClient.Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
});

// Initialize Core API client (for status check and notification handling)
export const coreApi = new midtransClient.CoreApi({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
});

/**
 * Verify Midtrans notification signature
 * This ensures the notification is genuinely from Midtrans
 */
export const verifySignature = (
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
): boolean => {
    const crypto = require('crypto');

    const string = `${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`;
    const hash = crypto
        .createHash('sha512')
        .update(string)
        .digest('hex');

    return hash === signatureKey;
};

export default { snap, coreApi, verifySignature };
