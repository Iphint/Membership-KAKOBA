import { PaginatedResponse, Product } from "@/types";
import api from "./axios";

export const getProducts = async (
    page = 1,
    limit = 10
): Promise<PaginatedResponse<Product>> => {
    const response = await api.get("/api/product-promos", {
        params: { page, limit },
    });
    return {
        data: response.data.data,
        pagination: response.data.pagination,
    };
};
export const createProduct = async (payload: any, images: File[]) => {
    const formData = new FormData();

    formData.append("product_name", payload.product_name);
    formData.append("price_normal", payload.price_normal);
    formData.append("discount", payload.discount);
    formData.append("product_category", payload.product_category);
    formData.append("product_description", payload.product_description);
    formData.append("point", payload.point);
    formData.append("start_date", payload.start_date);
    formData.append("end_date", payload.end_date);
    formData.append("stock", payload.stock);
    formData.append("is_available", String(payload.is_available));
    formData.append("is_featured", String(payload.is_featured));

    images.forEach((file) => {
        formData.append("images", file);
    });

    const res = await api.post("/api/product-promo", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};
export const updateProduct = async (
    id: number,
    payload: any,
    newImages: File[],
    imagesToDelete: number[]
) => {
    try {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
            formData.append(key, payload[key]);
        });
        newImages.forEach((file) => {
            formData.append("images", file);
        });
        formData.append(
            "imagesToDelete",
            JSON.stringify(imagesToDelete || [])
        );
        const response = await api.put(
            `/api/product-promo/${id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        const result = response.data;
        return result;
    } catch (error: any) {
        console.error("❌ Error updating product:", error);
        throw error;
    }
};
export const deleteProduct = async (id: number) => {
    const res = await api.delete(`/api/product-promo/${id}`);
    return res.data;
};
