/**
 * Standardized API Response Format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
}

/**
 * Success response helper
 */
export const successResponse = <T>(data: T): ApiResponse<T> => {
    return {
        success: true,
        data,
    };
};

/**
 * Error response helper
 */
export const errorResponse = (
    message: string,
    code?: string,
    details?: any
): ApiResponse => {
    return {
        success: false,
        error: {
            message,
            code,
            details,
        },
    };
};
