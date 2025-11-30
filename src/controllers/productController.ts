import { Request, Response, NextFunction } from 'express';
import productService from '../services/productService';
import { successResponse } from '../utils/response';
import { ProductQuery } from '../types/product.types';

/**
 * Product Controller
 * Handles HTTP requests for product endpoints
 */
class ProductController {
    /**
     * GET /api/v1/categories
     */
    async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await productService.getCategories();
            res.json(successResponse(categories));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products
     */
    async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query: ProductQuery = {
                category: req.query.category as string,
                search: req.query.search as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
            };

            const result = await productService.getProducts(query);
            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/:id
     */
    async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);
            res.json(successResponse(product));
        } catch (error) {
            next(error);
        }
    }
}

export default new ProductController();
