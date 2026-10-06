// --DONE -- //
// --DONE -- //
// --DONE -- //

import api from "./axios";
import { Payment, PaymentRequest, FeeHead } from "@/types/index";

export const feeHeadApi = {
  // FEE HEADS
  create: async (data: FeeHead) => {
    const res = await api.post<FeeHead>("/fees/head", data);
    return;
  },

  getAll: async () => {
    const res = await api.get<FeeHead[]>("/fees/head");
    return res.data;
  },

  update: async (id: number, data: FeeHead) => {
    const res = await api.put<FeeHead>(`/fees/head/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/fees/head/${id}`);
    return res.data;
  },

  //   PAYMENTS API'S ARE NEEDED TO CHECK FROM FRONTEND ABOVE API'S ARE RUNING PERFECTLY
  makePayments: async (data: PaymentRequest) => {
    const res = await api.post<Payment>(`/fees/payment`, data);
    return res.data;
  },

  getStudentPayments: async (id: number) => {
    const res = await api.get<Payment[]>(`/fees/payment/student/${id}`);
    return res.data;
  },
  

};
