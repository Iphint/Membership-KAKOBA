import { Event } from "@/types";
import api from "./axios";

export const getEvents = async (): Promise<Event[]> => {
    const response = await api.get("/api/events");
    return response.data.data;
};

export const getEventById = async (id: number): Promise<Event> => {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
}

export const createEvent = async (
    payload: Omit<Event, "id">,
    images: File[]
): Promise<Event> => {
    const formData = new FormData();

    formData.append("event_name", payload.event_name);
    formData.append("event_date", payload.event_date);
    formData.append("location", payload.location);
    formData.append("description", payload.description);

    images.forEach((file) => {
        formData.append("images", file);
    });

    const response = await api.post("/api/events", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data.data;
};

export const updateEvent = async (
    id: number,
    payload: Omit<Event, "id">,
    images: File[],
    imagesToDelete: number[] = []
): Promise<Event> => {
    const formData = new FormData();

    formData.append("event_name", payload.event_name);
    formData.append("event_date", payload.event_date);
    formData.append("location", payload.location);
    formData.append("description", payload.description);

    formData.append("imagesToDelete", JSON.stringify(imagesToDelete));

    images.forEach((file) => {
        formData.append("images", file);
    });

    const response = await api.put(`/api/event/${id}`, formData);

    return response.data.data;
};

export const deleteEvent = async (id: number): Promise<void> => {
    const response = await api.delete(`/api/event/${id}`);
    return response.data.data;
}