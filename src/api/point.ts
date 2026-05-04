import { Point } from "@/types";
import api from "./axios";

export const getPoints = async (): Promise<Point[]> => {
    const response = await api.get("/api/points");
    return response.data.data.data;
}