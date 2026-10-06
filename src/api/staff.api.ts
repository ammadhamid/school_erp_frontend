import api from "./axios";

import type {
  Staff,
  StaffDTO,
  SalaryStructure,
  SalaryStructureDTO,
  Payroll,
  PayrollRequestDTO,
} from "@/types";

export const staffApi = {
  // =========================
  // STAFF
  // =========================

  create: async (data: StaffDTO) => {
    const res = await api.post<StaffDTO>("/staff/create", data);

    return res.data;
  },

  update: async (id: number, data: StaffDTO) => {
    const res = await api.put<StaffDTO>(`/staff/${id}`, data);

    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get<Staff>(`/staff/${id}`);

    return res.data;
  },

  getAll: async () => {
    const res = await api.get<Staff[]>("/staff/active");

    return res.data;
  },

  deactivate: async (id: number) => {
    const res = await api.delete(`/staff/${id}`);

    return res.data;
  },

  // =========================
  // SALARY STRUCTURE
  // =========================

  createSalaryStructure: async (data: SalaryStructureDTO) => {
    const res = await api.post<SalaryStructureDTO>(
      "/staff/salary-structure",
      data,
    );

    return res.data;
  },

  updateSalaryStructure: async (id: number, data: SalaryStructureDTO) => {
    const res = await api.put<SalaryStructureDTO>(
      `/staff/salary-structure/${id}`,
      data,
    );

    return res.data;
  },

  getSalaryStructures: async () => {
    const res = await api.get<SalaryStructure[]>("/staff/salary-structure");

    return res.data;
  },

  // =========================
  // PAYROLL
  // =========================

  processPayroll: async (data: PayrollRequestDTO) => {
    const res = await api.post<Payroll>("/staff/payroll/process", data);

    return res.data;
  },

  getPayrollById: async (id: number) => {
    const res = await api.get<Payroll>(`/staff/payroll/${id}`);

    return res.data;
  },

  getPayrollsForStaff: async (staffId: number) => {
    const res = await api.get<Payroll[]>(`/staff/payroll/staff/${staffId}`);

    return res.data;
  },

  getAllPayrolls: async () => {
    const res = await api.get<Payroll[]>("/staff/payroll/all");

    return res.data;
  },

  // =========================
  // SALARY SLIP PDF
  // =========================

  getSalarySlip: async (id: number) => {
    const res = await api.get(`/staff/payroll/${id}/slip`, {
      responseType: "blob",
    });

    return res.data;
  },
};
