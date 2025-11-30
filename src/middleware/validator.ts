import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response';

/**
 * Validation middleware factory
 * Validates request body against Zod schema
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json(
                    errorResponse('Validation failed', 'VALIDATION_ERROR', errors)
                );
            } else {
                next(error);
            }
        }
    };
};

/**
 * Query validation middleware factory
 */
export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json(
                    errorResponse('Invalid query parameters', 'VALIDATION_ERROR', errors)
                );
            } else {
                next(error);
            }
        }
    };
};
