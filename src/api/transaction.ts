import { Transaction } from "@/types";
import api from "./axios";

export const getTransactions = async (): Promise<Transaction[]> => {
    const res = await api.get("/api/transactions");
    return res.data.data;
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
