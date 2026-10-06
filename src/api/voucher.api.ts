// --DONE -- //
// --DONE -- //
// --DONE -- //
import api from "./axios";
import type { Voucher } from "@/types";

export const voucherApi = {
  // if it doesnt run try the uncommented code chup
  create: async (data: {
    studentId: number;
    month: string;
    totalAmount?: number;
  }) => {
    const res = await api.post("/vouchers/", data);

    return res.data;
  },

  generateAdmissionVoucher: async (studentId: number) => {
    const res = await api.post(`/vouchers/admission/${studentId}`);

    return res.data;
  },

  getUnpaid: async () => {
    const res = await api.get<Voucher[]>("/vouchers/unpaid");
    return res.data;
  },

  markPaid: async (id: number) => {
    const res = await api.post(`/vouchers/${id}/mark-paid`);
    return res.data;
  },

  applyLateFees: async () => {
    const res = await api.post(`/vouchers/apply-late-fees`);
    return res.data;
  },

  getPdf: async (id: number) => {
    const res = await api.get(`/vouchers/${id}/pdf`, {
      responseType: "blob",
    });
    return res.data;
  },
};
