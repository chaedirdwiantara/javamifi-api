import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Import routes
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

/**
 * Create Express application
 */
export const createApp = (): Application => {
    const app = express();

    // Parse request body
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS configuration
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
    app.use(
        cors({
            origin: allowedOrigins,
            credentials: true,
        })
    );

    // Apply rate limiting
    app.use(apiLimiter);

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
        });
    });

    // API Routes
    app.use('/api/v1', productRoutes);
    app.use('/api/v1', orderRoutes);
    app.use('/api/v1', paymentRoutes);

    // 404 handler
    app.use(notFoundHandler);

    // Error handler (must be last)
    app.use(errorHandler);

    return app;
};

export default createApp;
