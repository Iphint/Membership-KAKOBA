import { ImageView } from "@/types";
import api from "./axios";

export const getBanners = async (): Promise<ImageView[]> => {
    const response = await api.get("/api/images-view");
    return response.data.data;
};

export const createImageView = async (payload: any, image: File) => {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("sub_title", payload.sub_title);
    formData.append("image", image);

    const res = await api.post("/api/image-view", formData);
    return res.data.data;
};

export const updateImageView = async (id: number, payload: any, image?: File) => {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("sub_title", payload.sub_title);

    if (image) {
        formData.append("image", image);
    }

    const res = await api.put(`/api/image-view/${id}`, formData);
    return res.data.data;
};

export const deleteImageView = async (id: number) => {
    await api.delete(`/api/image-view/${id}`);
};