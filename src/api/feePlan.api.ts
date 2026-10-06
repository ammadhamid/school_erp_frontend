
// --DONE -- //
// --DONE -- //
// --DONE -- //

import api from "./axios";
import { FeePlan, FeePlanRequest } from "@/types/index";

export const feePlanApi = {
  create: async (data: FeePlanRequest) => {
    const res = await api.post<FeePlan>("/fee-plans", data);
    return res.data;
  },
  getAll: async () => {
    try {
      const res = await api.get<FeePlan[]>(`/fee-plans`);
      return res.data;
    } catch {
      console.warn("GET /fee-plans not implemented in backend");
      return [];
    }
  },
  //  Not needed 
  getById: async (id: number) => {
    try {
      const res = await api.get<FeePlan>(`/fee-plans/${id}`);
      return res.data;
    } catch {
      console.warn(`GET /fee-plans/${id} not implemented in backend`);
      return null;
    }
  },
  // NO NEED FEE HEAD DELETE KRUNGA TO KHUDI DELETE AND UPDATE HOJAYENGY 
  update: async (id: number, data: FeePlanRequest) => {
    const res = await api.put<FeePlan>(`/fee-plans/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    await api.delete(`/fee-plans/${id}`);
  },
};
