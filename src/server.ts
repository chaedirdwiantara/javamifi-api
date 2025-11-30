import { createApp } from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/database';
import { logger } from './utils/logger';

/**
 * Start Express server
 */
const startServer = async () => {
    try {
        // Test database connection
        logger.info('Testing database connection...');
        const dbConnected = await testDatabaseConnection();

        if (!dbConnected) {
            logger.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Create Express app
        const app = createApp();

        // Start listening
        const PORT = parseInt(env.PORT);
        app.listen(PORT, () => {
            logger.success(`🚀 Server is running on port ${PORT}`);
            logger.info(`Environment: ${env.NODE_ENV}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
            logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start server
startServer();
