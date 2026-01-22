// types/index.ts

export interface User {
    id: number;
    name: string;
    phone: string;
    email?: string;
}

export interface Product {
    id: string | number;
    product_id?: string | number; // Для совместимости с разными эндпоинтами
    name: string;
    slug?: string; // <-- Добавлено для ЧПУ ссылок
    price: number;
    oldPrice?: number | null;
    discount_price?: number;
    image: string;
    rating?: string | number;
    reviews_count?: number;
    feedbacks?: number;
    stock?: number;
    brand?: {
        id: number;
        name: string;
        logo?: string;
    };
    seo?: {
        name: string;
        keywords?: string;
        description?: string;
    };
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    code?: number;
}