import supabase from '../config/database';
import {

    Category,
    ProductWithCategory,
    ProductQuery,
    PaginatedProducts
} from '../types/product.types';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Product Service
 * Handles all product-related business logic
 */
class ProductService {
    /**
     * Get all categories
     */
    async getCategories(): Promise<Category[]> {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            logger.error('Failed to get categories:', error);
            throw new ApiError('Failed to retrieve categories', 500);
        }
    }

    /**
     * Get all products with pagination and filtering
     */
    async getProducts(query: ProductQuery): Promise<PaginatedProducts> {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const offset = (page - 1) * limit;

            // Build query
            let queryBuilder = supabase
                .from('products')
                .select(`
          *,
          category:categories(id, name, icon)
        `, { count: 'exact' })
                .eq('is_active', true);

            // Apply filters
            if (query.category) {
                queryBuilder = queryBuilder.eq('category_id', query.category);
            }

            if (query.search) {
                queryBuilder = queryBuilder.ilike('name', `%${query.search}%`);
            }

            // Apply pagination
            queryBuilder = queryBuilder.range(offset, offset + limit - 1);

            const { data, count, error } = await queryBuilder;

            if (error) throw error;

            const products = (data || []) as any[];
            const total = count || 0;
            const totalPages = Math.ceil(total / limit);

            return {
                products: products.map(p => ({
                    ...p,
                    category: p.category || { id: '', name: 'Unknown', icon: '' },
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        } catch (error) {
            logger.error('Failed to get products:', error);
            throw new ApiError('Failed to retrieve products', 500);
        }
    }

    /**
     * Get product by ID
     */
    async getProductById(id: string): Promise<ProductWithCategory> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          category:categories(id, name, icon)
        `)
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                throw new ApiError('Product not found', 404);
            }

            return {
                ...data,
                category: data.category || { id: '', name: 'Unknown', icon: '' },
            } as ProductWithCategory;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            logger.error('Failed to get product:', error);
            throw new ApiError('Failed to retrieve product', 500);
        }
    }
    /**
     * Update product stock
     */
    async updateStock(id: string, quantity: number): Promise<void> {
        try {
            // Get current stock first to ensure we don't go below 0
            const product = await this.getProductById(id);

            if (product.stock < quantity) {
                throw new ApiError(`Insufficient stock for product ${product.name}`, 400);
            }

            const { error } = await supabase
                .from('products')
                .update({ stock: product.stock - quantity })
                .eq('id', id);

            if (error) throw error;

            logger.info(`Stock updated for product ${id}: -${quantity}`);
        } catch (error) {
            if (error instanceof ApiError) throw error;
            logger.error('Failed to update stock:', error);
            throw new ApiError('Failed to update product stock', 500);
        }
    }
}

export default new ProductService();
