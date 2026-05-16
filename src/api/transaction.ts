import { PaginatedResponse, Transaction } from "@/types";
import api from "./axios";

export const getTransactions = async (
    page = 1,
    limit = 10
): Promise<PaginatedResponse<Transaction>> => {
    const res = await api.get("/api/transactions", {
        params: { page, limit },
    });
    return {
        data: res.data.data,
        pagination: res.data.pagination,
    };
};

export const createTransaction = async (payload: any) => {
    const res = await api.post("/api/transaction", payload);
    return res.data;
};

export const deleteTransaction = async (id: number) => {
    const res = await api.delete(`/api/transaction/${id}`);
    return res.data;
};

export const deleteAllTransactions = async () => {
    const res = await api.delete("/api/transactions");
    return res.data;
}

export const scanReceiptTransaction = async (formData: FormData) => {
    const res = await api.post("/api/scan-receipt", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};
