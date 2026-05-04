import { User } from '@/types';
import api from './axios';

export const getUsers = async (): Promise<User[]> => {
    const res = await api.get("/api/users");
    return res.data.data;
  };

export const createUser = async (payload: any) => {
    const res = await api.post("/api/register", payload);
    return res.data;
};

export const updateUser = async (id: number, payload: any) => {
    const res = await api.put(`/api/user/${id}`, payload);
    return res.data;
}

export const deleteUser = async (id: number) => {
    const res = await api.delete(`/api/user/${id}`);
    return res.data;
}
