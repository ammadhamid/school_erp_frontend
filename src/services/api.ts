// API service layer - Integrated with Spring Boot backend
// Backend repo: https://github.com/ali-nasir7/abc_school

import type {
  Student,
  StudentDTO,
  Staff,
  StaffDTO,
  SalaryStructure,
  SalaryStructureDTO,
  Payroll,
  PayrollRequestDTO,
  FeeHead,
  FeePlan,
  FeePlanRequest,
  PaymentRequest,
  Payment,
  LedgerEntry,
  Voucher,
  AdmissionReportFilters,
  DashboardStats,
  LoginCredentials,
  AuthResponse,
  ReportFilters,
} from '@/types';


const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Generic API call handler with proper error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Special handler for PDF/Blob responses
async function apiBlobCall(endpoint: string): Promise<Blob> {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.blob();
}

// Multipart form data handler for file uploads
async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// =====================
// STUDENT APIs
// Endpoints: /api/students/*
// =====================
export const studentApi = {
  // POST /api/students/create - Create new student
  create: (data: StudentDTO) => 
    apiCall<StudentDTO>('/students/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/students/{id} - Get student by ID
  getById: (id: number) => 
    apiCall<Student>(`/students/${id}`),

  // GET /api/students -Get all students
  getAll: () => 
    apiCall<Student[]>('/students/all'), 

  // GET /api/students/gr/{gr} - Get student by GR number
  getByGrNumber: (grNumber: string) => 
    apiCall<Student>(`/students/gr/${encodeURIComponent(grNumber)}`),

  // GET /api/students/search?q={query} - Search students by name
  search: (query: string) => 
    apiCall<Student[]>(`/students/search?q=${encodeURIComponent(query)}`),

  // PUT /api/students/student/{id}/status?status={status} - Update student status
  updateStatus: (id: number, status: string) => 
    apiCall<Student>(`/students/student/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
    }),

  // POST /api/students/{id}/upload - Upload document/photo
  uploadDocument: (id: number, file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiUpload<string>(`/students/${id}/upload`, formData);
  },

  // POST /api/students/{studentId}/assign-plan/{feePlanId} - Assign fee plan
  assignFeePlan: (studentId: number, feePlanId: number) => 
    apiCall<Student>(`/students/${studentId}/assign-plan/${feePlanId}`, {
      method: 'POST',
    }),

  // POST /api/students/{id}/admission-voucher - Generate admission voucher PDF
  generateAdmissionVoucher: (id: number) => 
    apiBlobCall(`/students/${id}/admission-voucher`),

  // GET /api/students/student/{studentId}/due - Get student due amount
  getStudentDue: (studentId: number) => 
    apiCall<number>(`/students/student/${studentId}/due`),

  // GET /api/students/admissions/report - Get admission report with filters
  getAdmissionReport: (filters: AdmissionReportFilters) => {
    const params = new URLSearchParams();
    if (filters.className) params.append('className', filters.className);
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    const queryString = params.toString();
    return apiCall<Student[]>(`/students/admissions/report${queryString ? `?${queryString}` : ''}`);
  },
};

// =====================
// STAFF APIs
// Endpoints: /api/staff/*
// =====================
export const staffApi = {
  // POST /api/staff/create - Create new staff member
  create: (data: StaffDTO) => 
    apiCall<StaffDTO>('/staff/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /api/staff/{id} - Update staff member
  update: (id: number, data: StaffDTO) => 
    apiCall<StaffDTO>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // GET /api/staff/{id} - Get staff by ID
  getById: (id: number) => 
    apiCall<Staff>(`/staff/${id}`),

  // GET /api/staff/active - Get all active staff
  getActive: () => 
    apiCall<Staff[]>('/staff/active'),

  // DELETE /api/staff/{id} - Deactivate staff member
  deactivate: (id: number) => 
    apiCall<void>(`/staff/${id}`, {
      method: 'DELETE',
    }),
};

// =====================
// SALARY STRUCTURE APIs
// Endpoints: /api/staff/salary-structure/*
// =====================
export const salaryStructureApi = {
  // POST /api/staff/salary-structure - Create salary structure
  create: (data: SalaryStructureDTO) => 
    apiCall<SalaryStructureDTO>('/staff/salary-structure', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /api/staff/salary-structure/{id} - Update salary structure
  update: (id: number, data: SalaryStructureDTO) => 
    apiCall<SalaryStructureDTO>(`/staff/salary-structure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // GET /api/staff/salary-structure - List all salary structures
  getAll: () => 
    apiCall<SalaryStructure[]>('/staff/salary-structure'),

  // GET /api/staff/salary-structure/{id} - Get salary structure by ID
  getById: (id: number) => 
    apiCall<SalaryStructure>(`/staff/salary-structure/${id}`),

  // DELETE /api/staff/salary-structure/{id} - Delete salary structure
  delete: (id: number) => 
    apiCall<void>(`/staff/salary-structure/${id}`, {
      method: 'DELETE',
    }),
};

// =====================
// PAYROLL APIs
// Endpoints: /api/staff/payroll/*
// =====================
export const payrollApi = {
  // POST /api/staff/payroll/process - Process payroll
  process: (data: PayrollRequestDTO) => 
    apiCall<Payroll>('/staff/payroll/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/staff/payroll/staff/{staffId} - Get payroll history for staff
  getByStaff: (staffId: number) => 
    apiCall<Payroll[]>(`/staff/payroll/staff/${staffId}`),

  // GET /api/staff/payroll/{id} - Get payroll by ID
  getById: (id: number) => 
    apiCall<Payroll>(`/staff/payroll/${id}`),

  // GET /api/staff/payroll/{id}/slip - Generate salary slip PDF
  generateSlip: (id: number) => 
    apiBlobCall(`/staff/payroll/${id}/slip`),

  // GET /api/staff/payroll/all - Get all payroll records
  getAll: () => 
    apiCall<Payroll[]>('/staff/payroll/all'),
};

// =====================
// FEE PLAN APIs
// Endpoints: /api/fee-plans/*
// =====================
export const feePlanApi = {
  // POST /api/fee-plans - Create fee plan
  create: (data: FeePlanRequest) => 
    apiCall<FeePlan>('/fee-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// =====================
// FEE HEAD APIs
// Endpoints: /api/fees/head/*
// =====================
export const feeHeadApi = {
  // POST /api/fees/head - Create fee head
  create: (data: FeeHead) => 
    apiCall<FeeHead>('/fees/head', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/fees/head - Get all fee heads
  getAll: () => 
    apiCall<FeeHead[]>('/fees/head'),

  // PUT /api/fees/head/{id} - Update fee head
  update: (id: number, data: FeeHead) => 
    apiCall<FeeHead>(`/fees/head/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /api/fees/head/{id} - Delete fee head
  delete: (id: number) => 
    apiCall<void>(`/fees/head/${id}`, {
      method: 'DELETE',
    }),
};

// =====================
// PAYMENT APIs
// Endpoints: /api/fees/payment/*
// =====================
export const paymentApi = {
  // POST /api/fees/payment - Make payment
  makePayment: (data: PaymentRequest) => 
    apiCall<Payment>('/fees/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/fees/payment/student/{studentId} - Get student payment history
  getStudentPayments: (studentId: number) => 
    apiCall<Payment[]>(`/fees/payment/student/${studentId}`),
};

// =====================
// LEDGER APIs
// Endpoints: /api/ledger/*
// =====================
export const ledgerApi = {
  // GET /api/ledger/student/{studentId} - Get student ledger
  getByStudent: (studentId: number) => 
    apiCall<LedgerEntry>(`/ledger/student/${studentId}`),

  // GET /api/ledger/all - Get all ledger entries
  getAll: () => 
    apiCall<LedgerEntry[]>('/ledger/all'),
};

// =====================
// VOUCHER APIs
// Endpoints: /api/vouchers/*
// =====================
export const voucherApi = {
  // GET /api/vouchers/unpaid - List all unpaid vouchers
  getUnpaid: () => 
    apiCall<Voucher[]>('/vouchers/unpaid'),

  // POST /api/vouchers/ - Create new voucher
  create: (data: Voucher) => 
    apiCall<Voucher>('/vouchers/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /api/vouchers/{id}/mark-paid - Mark voucher as paid
  markPaid: (id: number) => 
    apiCall<Voucher>(`/vouchers/${id}/mark-paid`, {
      method: 'POST',
    }),

  // GET /api/vouchers/{id}/pdf - Get voucher PDF
  getPdf: (id: number) => 
    apiBlobCall(`/vouchers/${id}/pdf`),

  // POST /api/vouchers/apply-late-fees - Apply late fees
  applyLateFees: () => 
    apiCall<string>('/vouchers/apply-late-fees', {
      method: 'POST',
    }),
};

// =====================
// DASHBOARD APIs (Aggregated on Client)
// Endpoints: /api/dashboard/*
// =====================
export const dashboardApi = {
  // GET /api/dashboard/stats - Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [students, staff, vouchers] = await Promise.all([
        studentApi.getAll(),
        staffApi.getActive(),
        voucherApi.getUnpaid(),
      ]);

      const totalStudents = students.length;
      const totalStaff = staff.length;
      const pendingFees = vouchers.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
      
      // Calculate revenue from ledgers
      let totalRevenue = 0;
      try {
        const ledgers = await ledgerApi.getAll();
        totalRevenue = ledgers.reduce((sum, l) => sum + (l.totalPaid || 0), 0);
      } catch (e) {
        console.warn('Failed to fetch ledgers for revenue stats', e);
      }

      // New admissions (current month)
      const now = new Date();
      const newAdmissions = students.filter(s => {
        if (!s.admissionDate) return false;
        const d = new Date(s.admissionDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      return {
        totalStudents,
        totalStaff,
        totalRevenue,
        pendingFees,
        monthlyCollection: 0, // Difficult to calculate without transaction history
        newAdmissions,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      throw error;
    }
  },

  // GET /api/dashboard/activities - Get recent activities
  getRecentActivities: async () => {
    return []; // Mock empty activities
  },
};

// =====================
// REPORTS APIs (Client-side filtering)
// Endpoints: /api/reports/*
// =====================
export const reportApi = {
  // POST /api/reports/students - Generate student report
  studentReport: async (filters: ReportFilters = {}) => {
    const students = await studentApi.getAll();
    return students.filter(s => {
      if (filters.className && s.className !== filters.className) return false;
      // Add other filters logic here if needed
      return true;
    });
  },

  // POST /api/reports/financial - Generate financial report
  financialReport: async (filters: ReportFilters = {}) => {
    return []; // Not fully implemented
  },

  // POST /api/reports/staff - Generate staff report
  staffReport: async (filters: ReportFilters = {}) => {
    return staffApi.getActive();
  },

  // GET /api/reports/generate?type={type} - Generate any report (returns PDF)
  generate: async (reportType: string, filters?: ReportFilters) => {
    return apiBlobCall(`/reports/generate?type=${encodeURIComponent(reportType)}`);
  },
};

// =====================
// AUTH APIs (Mock Implementation)
// Endpoints: /api/auth/*
// =====================
export const authApi = {
  // POST /api/auth/login - Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    
    // Mock successful login
    return {
      token: 'mock-jwt-token-dev',
      user: {
        id: 1,
        username: credentials.username,
        role: 'ADMIN',
        name: 'Admin User',
      },
    };
  },

  // POST /api/auth/logout - Logout
  logout: async () => {
    localStorage.removeItem('authToken');
  },

  // GET /api/auth/verify - Verify token
  verifyToken: async () => {
    return { valid: true };
  },
};

// =====================
// HELPER: Download PDF blob
// =====================
export const downloadPdf = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// =====================
// HELPER: Open PDF in new tab
// =====================
export const openPdfInNewTab = (blob: Blob) => {
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
};
