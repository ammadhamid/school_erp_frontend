// API service layer - ready for Spring Boot backend integration
// Just replace the BASE_URL with your Spring Boot backend URL

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Generic API call handler
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
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Student APIs
export const studentApi = {
  getAll: () => apiCall<any[]>('/students'),
  getById: (id: string) => apiCall<any>(`/students/${id}`),
  create: (data: any) => apiCall<any>('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/students/${id}`, {
    method: 'DELETE',
  }),
  search: (query: string) => apiCall<any[]>(`/students/search?q=${encodeURIComponent(query)}`),
};

// Staff APIs
export const staffApi = {
  getAll: () => apiCall<any[]>('/staff'),
  getById: (id: string) => apiCall<any>(`/staff/${id}`),
  create: (data: any) => apiCall<any>('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/staff/${id}`, {
    method: 'DELETE',
  }),
};

// Fee APIs
export const feeApi = {
  getConfiguration: () => apiCall<any>('/fees/configuration'),
  updateConfiguration: (data: any) => apiCall<any>('/fees/configuration', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  collectFee: (data: any) => apiCall<any>('/fees/collect', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getStudentLedger: (studentId: string) => apiCall<any[]>(`/fees/ledger/${studentId}`),
  generateVoucher: (studentId: string, month: string) => apiCall<any>('/fees/voucher', {
    method: 'POST',
    body: JSON.stringify({ studentId, month }),
  }),
  getVouchers: (studentId?: string) => apiCall<any[]>(`/fees/vouchers${studentId ? `?studentId=${studentId}` : ''}`),
  getTransactions: () => apiCall<any[]>('/fees/transactions'),
};

// Payroll APIs
export const payrollApi = {
  getAll: (month?: string) => apiCall<any[]>(`/payroll${month ? `?month=${month}` : ''}`),
  process: (month: string) => apiCall<any>('/payroll/process', {
    method: 'POST',
    body: JSON.stringify({ month }),
  }),
  generateSlip: (staffId: string, month: string) => apiCall<any>('/payroll/slip', {
    method: 'POST',
    body: JSON.stringify({ staffId, month }),
  }),
};

// Reports APIs
export const reportApi = {
  generate: (reportType: string, filters?: any) => apiCall<Blob>('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ reportType, filters }),
  }),
  studentReport: (filters?: any) => apiCall<any>('/reports/students', {
    method: 'POST',
    body: JSON.stringify(filters),
  }),
  financialReport: (filters?: any) => apiCall<any>('/reports/financial', {
    method: 'POST',
    body: JSON.stringify(filters),
  }),
  staffReport: (filters?: any) => apiCall<any>('/reports/staff', {
    method: 'POST',
    body: JSON.stringify(filters),
  }),
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () => apiCall<any>('/dashboard/stats'),
  getRecentActivities: () => apiCall<any[]>('/dashboard/activities'),
};

// Auth APIs
export const authApi = {
  login: (credentials: { username: string; password: string }) => apiCall<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  logout: () => apiCall<void>('/auth/logout', {
    method: 'POST',
  }),
  verifyToken: () => apiCall<any>('/auth/verify'),
};
