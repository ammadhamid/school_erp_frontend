// =====================================================
// OPTIMIZED API SERVICE LAYER
// Backend: https://github.com/ali-nasir7/abc_school
// =====================================================

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

// =====================================================
// CONFIGURATION
// =====================================================
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// =====================================================
// TYPES & INTERFACES
// =====================================================
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: boolean;
  retryAttempts?: number;
  skipAuth?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

// =====================================================
// CACHE MANAGER
// =====================================================
class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

const cacheManager = new CacheManager();

// =====================================================
// REQUEST QUEUE & RATE LIMITING
// =====================================================
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly MAX_CONCURRENT = 6;
  private activeRequests = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.activeRequests >= this.MAX_CONCURRENT) return;
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeRequests < this.MAX_CONCURRENT) {
      const request = this.queue.shift();
      if (request) {
        this.activeRequests++;
        request().finally(() => {
          this.activeRequests--;
          this.process();
        });
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// =====================================================
// ABORT CONTROLLER MANAGER
// =====================================================
class AbortControllerManager {
  private controllers = new Map<string, AbortController>();

  create(key: string): AbortController {
    this.abort(key); // Cancel any existing request
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  abort(key: string): void {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  abortAll(): void {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
  }
}

const abortManager = new AbortControllerManager();

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
};

const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

const removeAuthToken = (): void => {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

// =====================================================
// ERROR HANDLING
// =====================================================
class ApiErrorHandler {
  static async handleResponse(response: Response): Promise<any> {
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) {
        return undefined;
      }

      // Handle other successful responses
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }

    // Handle error responses
    await this.handleErrorResponse(response);
  }

  private static async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ApiError;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        const text = await response.text();
        errorData = { message: text || 'Request failed' };
      }
    } catch {
      errorData = { message: 'Request failed' };
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        this.handleUnauthorized();
        throw new Error(errorData.message || 'Unauthorized - Please login again');
      
      case 403:
        throw new Error(errorData.message || 'Forbidden - You do not have permission');
      
      case 404:
        throw new Error(errorData.message || 'Resource not found');
      
      case 422:
        throw new Error(errorData.message || 'Validation failed');
      
      case 500:
        throw new Error(errorData.message || 'Internal server error');
      
      case 503:
        throw new Error('Service temporarily unavailable');
      
      default:
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }

  private static handleUnauthorized(): void {
    removeAuthToken();
    cacheManager.clear();
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

// =====================================================
// CORE API FUNCTIONS
// =====================================================
async function apiCall<T>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<T> {
  const {
    timeout = REQUEST_TIMEOUT,
    retry = true,
    retryAttempts = MAX_RETRY_ATTEMPTS,
    skipAuth = false,
    ...fetchOptions
  } = options;

  const url = `${BASE_URL}${endpoint}`;
  const method = fetchOptions.method || 'GET';
  
  // Check cache for GET requests
  if (method === 'GET') {
    const cached = cacheManager.get<T>(url);
    if (cached !== null) {
      return cached;
    }
  }

  // Create abort controller for timeout
  const controller = abortManager.create(url);
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    signal: controller.signal,
  };

  let lastError: Error | null = null;
  let attempt = 0;

  // Retry logic
  while (attempt < (retry ? retryAttempts : 1)) {
    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const data = await ApiErrorHandler.handleResponse(response);
      
      // Cache successful GET requests
      if (method === 'GET' && data !== undefined) {
        cacheManager.set(url, data);
      }
      
      // Clear related cache on mutations
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const resourcePath = endpoint.split('/')[1]; // e.g., 'students' from '/students/123'
        cacheManager.clear(resourcePath);
      }
      
      return data as T;
      
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (error instanceof Error) {
        const status = (error as any).status;
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          throw error;
        }
      }
      
      // Don't retry if request was aborted intentionally
      if (error instanceof Error && error.name === 'AbortError' && !retry) {
        throw new Error('Request was cancelled');
      }
      
      attempt++;
      
      if (attempt < retryAttempts) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`Request failed, retrying in ${delay}ms... (Attempt ${attempt}/${retryAttempts})`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Request failed after multiple attempts');
}

// =====================================================
// BLOB/PDF HANDLER
// =====================================================
async function apiBlobCall(
  endpoint: string,
  options: RequestConfig = {}
): Promise<Blob> {
  const {
    timeout = REQUEST_TIMEOUT,
    skipAuth = false,
    ...fetchOptions
  } = options;

  const url = `${BASE_URL}${endpoint}`;
  const controller = abortManager.create(url);
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const headers: HeadersInit = { ...fetchOptions.headers };
  
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Validate blob
    if (blob.size === 0) {
      throw new Error('Received empty file');
    }

    return blob;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Download was cancelled or timed out');
    }
    
    throw error;
  }
}

// =====================================================
// FILE UPLOAD HANDLER
// =====================================================
async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: RequestConfig = {}
): Promise<T> {
  const {
    timeout = 60000, // 60 seconds for uploads
    skipAuth = false,
    ...fetchOptions
  } = options;

  const url = `${BASE_URL}${endpoint}`;
  const controller = abortManager.create(url);
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const headers: HeadersInit = { ...fetchOptions.headers };
  
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
      ...fetchOptions,
    });

    clearTimeout(timeoutId);
    return await ApiErrorHandler.handleResponse(response);
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Upload was cancelled or timed out');
    }
    
    throw error;
  }
}

// =====================================================
// STUDENT API
// =====================================================
export const studentApi = {
  create: (data: StudentDTO) =>
    apiCall<StudentDTO>('/students/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: number) =>
    apiCall<Student>(`/students/${id}`),

  getAll: () =>
    apiCall<Student[]>('/students/all'),

  getByGrNumber: (grNumber: string) =>
    apiCall<Student>(`/students/gr/${encodeURIComponent(grNumber)}`),

  search: (query: string) =>
    apiCall<Student[]>(`/students/search?q=${encodeURIComponent(query)}`),

  updateStatus: (id: number, status: string) =>
    apiCall<Student>(`/students/student/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
    }),

  uploadDocument: (id: number, file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiUpload<string>(`/students/${id}/upload`, formData);
  },

  assignFeePlan: (studentId: number, feePlanId: number) =>
    apiCall<Student>(`/students/${studentId}/assign-plan/${feePlanId}`, {
      method: 'POST',
    }),

  generateAdmissionVoucher: (id: number) =>
    apiBlobCall(`/students/${id}/admission-voucher`),

  getStudentDue: (studentId: number) =>
    apiCall<number>(`/students/student/${studentId}/due`),

  getAdmissionReport: (filters: AdmissionReportFilters) => {
    const params = new URLSearchParams();
    if (filters.className) params.append('className', filters.className);
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    const queryString = params.toString();
    return apiCall<Student[]>(
      `/students/admissions/report${queryString ? `?${queryString}` : ''}`
    );
  },
};

// =====================================================
// STAFF API
// =====================================================
export const staffApi = {
  create: (data: StaffDTO) =>
    apiCall<StaffDTO>('/staff/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: StaffDTO) =>
    apiCall<StaffDTO>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getById: (id: number) =>
    apiCall<Staff>(`/staff/${id}`),

  getActive: () =>
    apiCall<Staff[]>('/staff/active'),

  deactivate: (id: number) =>
    apiCall<void>(`/staff/${id}`, {
      method: 'DELETE',
    }),
};

// =====================================================
// SALARY STRUCTURE API
// =====================================================
export const salaryStructureApi = {
  create: (data: SalaryStructureDTO) =>
    apiCall<SalaryStructureDTO>('/staff/salary-structure', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: SalaryStructureDTO) =>
    apiCall<SalaryStructureDTO>(`/staff/salary-structure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    apiCall<SalaryStructure[]>('/staff/salary-structure'),

  getById: (id: number) =>
    apiCall<SalaryStructure>(`/staff/salary-structure/${id}`),

  delete: (id: number) =>
    apiCall<void>(`/staff/salary-structure/${id}`, {
      method: 'DELETE',
    }),
};

// =====================================================
// PAYROLL API
// =====================================================
export const payrollApi = {
  process: (data: PayrollRequestDTO) =>
    apiCall<Payroll>('/staff/payroll/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByStaff: (staffId: number) =>
    apiCall<Payroll[]>(`/staff/payroll/staff/${staffId}`),

  getById: (id: number) =>
    apiCall<Payroll>(`/staff/payroll/${id}`),

  generateSlip: (id: number) =>
    apiBlobCall(`/staff/payroll/${id}/slip`),

  getAll: () =>
    apiCall<Payroll[]>('/staff/payroll/all'),
};

// =====================================================
// FEE PLAN API
// =====================================================
export const feePlanApi = {
  create: (data: FeePlanRequest) =>
    apiCall<FeePlan>('/fee-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// =====================================================
// FEE HEAD API
// =====================================================
export const feeHeadApi = {
  create: (data: FeeHead) =>
    apiCall<FeeHead>('/fees/head', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    apiCall<FeeHead[]>('/fees/head'),

  update: (id: number, data: FeeHead) =>
    apiCall<FeeHead>(`/fees/head/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiCall<void>(`/fees/head/${id}`, {
      method: 'DELETE',
    }),
};

// =====================================================
// PAYMENT API
// =====================================================
export const paymentApi = {
  makePayment: (data: PaymentRequest) =>
    apiCall<Payment>('/fees/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStudentPayments: (studentId: number) =>
    apiCall<Payment[]>(`/fees/payment/student/${studentId}`),

  getAll: () =>
    apiCall<Payment[]>('/fees/payment/all'),
};

// =====================================================
// LEDGER API
// =====================================================
export const ledgerApi = {
  getByStudent: (studentId: number) =>
    apiCall<LedgerEntry>(`/ledger/student/${studentId}`),

  getAll: () =>
    apiCall<LedgerEntry[]>('/ledger/all'),
};

// =====================================================
// VOUCHER API
// =====================================================
export const voucherApi = {
  getUnpaid: () =>
    apiCall<Voucher[]>('/vouchers/unpaid'),

  getAll: () =>
    apiCall<Voucher[]>('/vouchers/all'),

  create: (data: Voucher) =>
    apiCall<Voucher>('/vouchers/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markPaid: (id: number) =>
    apiCall<Voucher>(`/vouchers/${id}/mark-paid`, {
      method: 'POST',
    }),

  getPdf: (id: number) =>
    apiBlobCall(`/vouchers/${id}/pdf`),

  applyLateFees: () =>
    apiCall<string>('/vouchers/apply-late-fees', {
      method: 'POST',
    }),
};

// =====================================================
// DASHBOARD API - Real Data Aggregation
// =====================================================
export interface MonthlyCollectionData {
  month: string;
  collections: number;
}

export interface ClassWiseStudentData {
  class: string;
  students: number;
}

export interface FeeStatusData {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: number;
  text: string;
  time: string;
  type: 'payment' | 'admission' | 'voucher' | 'staff';
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Fetch data with proper type annotations
      let students: Student[] = [];
      let staff: Staff[] = [];
      let vouchers: Voucher[] = [];
      let ledgers: LedgerEntry[] = [];

      try {
        students = await studentApi.getAll();
      } catch {
        students = [];
      }

      try {
        staff = await staffApi.getActive();
      } catch {
        staff = [];
      }

      try {
        vouchers = await voucherApi.getUnpaid();
      } catch {
        vouchers = [];
      }

      try {
        ledgers = await ledgerApi.getAll();
      } catch {
        ledgers = [];
      }

      const totalStudents = students.length;
      const totalStaff = staff.length;
      
      let pendingFees = 0;
      vouchers.forEach(v => {
        pendingFees += v.totalAmount || 0;
      });

      let totalRevenue = 0;
      ledgers.forEach(l => {
        totalRevenue += l.totalPaid || 0;
      });

      // Calculate monthly collection (payments in current month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let monthlyCollection = 0;
      ledgers.forEach(ledger => {
        if (ledger.transactions) {
          ledger.transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
              monthlyCollection += tx.credit || 0;
            }
          });
        }
      });

      // New admissions (current month)
      const newAdmissions = students.filter(s => {
        if (!s.admissionDate) return false;
        const d = new Date(s.admissionDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      return {
        totalStudents,
        totalStaff,
        totalRevenue,
        pendingFees,
        monthlyCollection,
        newAdmissions,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      throw error;
    }
  },

  getMonthlyCollections: async (): Promise<MonthlyCollectionData[]> => {
    try {
      const ledgers = await ledgerApi.getAll().catch(() => []);
      const monthlyData: Record<string, number> = {};
      
      // Get last 6 months
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = months[d.getMonth()];
        monthlyData[key] = 0;
      }

      // Aggregate collections from ledger transactions
      ledgers.forEach(ledger => {
        if (ledger.transactions) {
          ledger.transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const monthDiff = (now.getFullYear() - txDate.getFullYear()) * 12 + (now.getMonth() - txDate.getMonth());
            
            if (monthDiff >= 0 && monthDiff < 6) {
              const key = months[txDate.getMonth()];
              if (monthlyData[key] !== undefined) {
                monthlyData[key] += tx.credit || 0;
              }
            }
          });
        }
      });

      return Object.entries(monthlyData).map(([month, collections]) => ({
        month,
        collections,
      }));
    } catch (error) {
      console.error('Failed to fetch monthly collections', error);
      return [];
    }
  },

  getClassWiseStudents: async (): Promise<ClassWiseStudentData[]> => {
    try {
      const students = await studentApi.getAll().catch(() => []);
      const classData: Record<string, number> = {};

      students.forEach(student => {
        const className = student.className || 'Unknown';
        classData[className] = (classData[className] || 0) + 1;
      });

      // Sort by class name
      const sortedClasses = Object.keys(classData).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

      return sortedClasses.map(className => ({
        class: className,
        students: classData[className],
      }));
    } catch (error) {
      console.error('Failed to fetch class wise students', error);
      return [];
    }
  },

  getFeeStatus: async (): Promise<FeeStatusData[]> => {
    try {
      // Try to get all vouchers, if endpoint doesn't exist use unpaid
      let vouchers: Voucher[] = [];
      try {
        vouchers = await voucherApi.getAll();
      } catch {
        vouchers = await voucherApi.getUnpaid().catch(() => []);
      }
      
      let paid = 0;
      let pending = 0;
      let overdue = 0;

      vouchers.forEach(voucher => {
        if (voucher.status === 'PAID') {
          paid++;
        } else if (voucher.status === 'OVERDUE') {
          overdue++;
        } else {
          pending++;
        }
      });

      const total = paid + pending + overdue || 1; // Avoid division by zero

      return [
        { name: 'Paid', value: Math.round((paid / total) * 100), color: 'hsl(var(--success))' },
        { name: 'Pending', value: Math.round((pending / total) * 100), color: 'hsl(var(--warning))' },
        { name: 'Overdue', value: Math.round((overdue / total) * 100), color: 'hsl(var(--destructive))' },
      ];
    } catch (error) {
      console.error('Failed to fetch fee status', error);
      return [
        { name: 'Paid', value: 0, color: 'hsl(var(--success))' },
        { name: 'Pending', value: 0, color: 'hsl(var(--warning))' },
        { name: 'Overdue', value: 0, color: 'hsl(var(--destructive))' },
      ];
    }
  },

  getRecentActivities: async (): Promise<RecentActivity[]> => {
    try {
      const activities: RecentActivity[] = [];
      
      // Get recent students (new admissions)
      const students = await studentApi.getAll().catch(() => []);
      const recentStudents = students
        .filter(s => s.admissionDate)
        .sort((a, b) => new Date(b.admissionDate!).getTime() - new Date(a.admissionDate!).getTime())
        .slice(0, 3);

      recentStudents.forEach((student, i) => {
        activities.push({
          id: i + 1,
          text: `New student admitted: ${student.fullName} (${student.className || 'N/A'})`,
          time: student.admissionDate || 'Recently',
          type: 'admission',
        });
      });

      // Get recent vouchers
      const vouchers = await voucherApi.getUnpaid().catch(() => []);
      vouchers.slice(0, 2).forEach((voucher, i) => {
        activities.push({
          id: 100 + i,
          text: `Fee voucher pending: ${voucher.student?.fullName || 'Student'} - PKR ${voucher.totalAmount?.toLocaleString()}`,
          time: voucher.dueDate || 'Due soon',
          type: 'voucher',
        });
      });

      return activities.slice(0, 5);
    } catch (error) {
      console.error('Failed to fetch recent activities', error);
      return [];
    }
  },
};

// =====================================================
// REPORT API
// =====================================================
export const reportApi = {
  studentReport: async (filters: ReportFilters = {}) => {
    const students = await studentApi.getAll();
    return students.filter(s => {
      if (filters.className && s.className !== filters.className) return false;
      return true;
    });
  },

  financialReport: async (filters: ReportFilters = {}) => {
    return ledgerApi.getAll();
  },

  staffReport: async (filters: ReportFilters = {}) => {
    return staffApi.getActive();
  },

  generate: async (reportType: string, filters?: ReportFilters) => {
    return apiBlobCall(`/reports/generate?type=${encodeURIComponent(reportType)}`);
  },
};

// =====================================================
// AUTH API
// =====================================================
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  logout: async () => {
    try {
      await apiCall<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      removeAuthToken();
      cacheManager.clear();
      abortManager.abortAll();
    }
  },

  verifyToken: async () => {
    return apiCall<{ valid: boolean }>('/auth/verify');
  },

  refreshToken: async () => {
    const response = await apiCall<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================
export const downloadPdf = (blob: Blob, filename: string): void => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Failed to download PDF:', error);
    throw new Error('Failed to download file');
  }
};

export const openPdfInNewTab = (blob: Blob): void => {
  try {
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
    
    // Cleanup after 5 seconds
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 5000);
  } catch (error) {
    console.error('Failed to open PDF:', error);
    throw new Error('Failed to open file in new tab');
  }
};

// =====================================================
// UTILITY EXPORTS
// =====================================================
export const apiUtils = {
  clearCache: (pattern?: string) => cacheManager.clear(pattern),
  invalidateCache: (key: string) => cacheManager.invalidate(key),
  abortRequest: (endpoint: string) => abortManager.abort(`${BASE_URL}${endpoint}`),
  abortAllRequests: () => abortManager.abortAll(),
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};

// =====================================================
// DEFAULT EXPORT
// =====================================================
export default {
  student: studentApi,
  staff: staffApi,
  salaryStructure: salaryStructureApi,
  payroll: payrollApi,
  feePlan: feePlanApi,
  feeHead: feeHeadApi,
  payment: paymentApi,
  ledger: ledgerApi,
  voucher: voucherApi,
  dashboard: dashboardApi,
  report: reportApi,
  auth: authApi,
  utils: apiUtils,
};
