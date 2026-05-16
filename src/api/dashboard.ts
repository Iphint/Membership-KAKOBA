import { DashboardSummary } from "@/types";
import api from "./axios";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get("/api/dashboard-summary");
  return res.data.data;
};
