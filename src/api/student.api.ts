import api from "./axios";
import type { StudentDTO, Student, StudentStatus } from "@/types";

// type CreateStudentResponse = {
//   student: StudentDTO;
//   voucherPdf: Blob;
// };

export const studentApi = {
  // CREATE student
  create: async (data: StudentDTO) => {
    const res = await api.post<StudentDTO>("/students/create", data);

    return res.data;
  },

  // GET all students
  getAll: async () => {
    const res = await api.get<StudentDTO[]>("/students/all");

    return res.data;
  },

  // GET by ID
  getById: async (id: number) => {
    const res = await api.get<StudentDTO>(`/students/${id}`);

    return res.data;
  },

  // GET by GR number
  getByGr: async (gr: string) => {
    const res = await api.get<StudentDTO>(`/students/gr/${gr}`);

    return res.data;
  },

  // SEARCH students
  search: async (query: string) => {
    const res = await api.get<StudentDTO[]>("/students/search", {
      params: {
        q: query,
      },
    });

    return res.data;
  },

  // CHANGE status
  updateStatus: async (id: number, status: string) => {
    const res = await api.put<Student>(
      `/students/student/${id}/status?status=${status}`,
    );

    return res.data;
  },

  // UPLOAD document
  uploadDocument: async (id: number, file: File, type: string) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("type", type);

    const res = await api.post(`/students/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  // GENERATE admission voucher PDF
  generateAdmissionVoucher: async (id: number) => {
    const res = await api.post(
      `/students/${id}/admission-voucher`,
      {},
      {
        responseType: "blob",
      },
    );

    return res.data;
  },

  // ASSIGN fee plan
  assignFeePlan: async (studentId: number, planId: number) => {
    const res = await api.post<StudentDTO>(
      `/students/${studentId}/assign-plan/${planId}`,
    );

    return res.data;
  },

  // GET admission reports
  getAdmissionReport: async (params?: {
    className?: string;
    start?: string;
    end?: string;
  }) => {
    const res = await api.get<StudentDTO[]>("/students/admissions/report", {
      params,
    });

    return res.data;
  },

  // GET student due
  getStudentDue: async (studentId: number) => {
    const res = await api.get<number>(`/students/student/${studentId}/due`);

    return res.data;
  },
};
