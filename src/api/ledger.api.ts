import api from "./axios";
import { LedgerEntry, LedgerTransaction } from "@/types/index";

export const ledgerApi = {
  getByStudent: async (id: number) => {
    const res = await api.get<LedgerEntry>(`/ledger/student/${id}`);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get<LedgerEntry[]>("ledger/all");
    return res.data;
  },
  getTransactions: async (studentId: number) => {
    const res = await api.get(`/ledger/${studentId}/transactions`);
    return res.data;
  },
};
