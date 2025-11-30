import { Request, Response, NextFunction } from 'express';
import orderService from '../services/orderService';
import { successResponse } from '../utils/response';
import { CreateOrderRequest } from '../types/order.types';

/**
 * Order Controller
 * Handles HTTP requests for order endpoints
 */
class OrderController {
    /**
     * POST /api/v1/orders
     */
    async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const orderRequest: CreateOrderRequest = req.body;
            const result = await orderService.createOrder(orderRequest);
            res.status(201).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders/:orderId
     */
    async getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { orderId } = req.params;
            const order = await orderService.getOrderById(orderId);
            res.json(successResponse(order));
        } catch (error) {
            next(error);
        }
    }
}

export default new OrderController();
