// Product Types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    image_url: string;
    specs: Record<string, any>;
    stock: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    created_at: string;
}

export interface ProductWithCategory extends Product {
    category: Category;
}

export interface ProductQuery {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedProducts {
    products: ProductWithCategory[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
