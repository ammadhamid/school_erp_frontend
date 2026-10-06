// Centralized type definitions - Matching Spring Boot backend DTOs
// Backend repo: https://github.com/ali-nasir7/abc_school

// =====================
// ENUMS
// =====================
export type StudentStatus = "ACTIVE" | "INACTIVE" | "LEFT";

export type StaffDesignation =
  | "TEACHER"
  | "PRINCIPAL"
  | "VICE_PRINCIPAL"
  | "ADMIN"
  | "ACCOUNTANT"
  | "LIBRARIAN"
  | "PEON"
  | "SECURITY"
  | "CLEANER"
  | "OTHER";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "ONLINE" | "CHEQUE";

export type VoucherStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

// =====================
// STUDENT TYPES
// =====================
export interface StudentDTO {
  id?: number;
  fullName: string;
  fatherName?: string;
  motherName?: string;
  fatherCnic: string; // Format: 12345-1234567-1
  motherCnic: string; // Format: 12345-1234567-1
  dateOfBirth?: string; // LocalDate format: YYYY-MM-DD
  className?: string;
  section?: string;
  groupName?: string;
  admissionDate?: string;
  previousSchool?: string;
  parentContact1?: string;
  parentContact2?: string;
  address?: string;
  studentCnic?: string;
  grNumber?: string;
  rollNumber?: number;
  studentStatus?: StudentStatus;
  feePlanId?: number;
}

export interface Student extends StudentDTO {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

// =====================
// STAFF TYPES
// =====================
export interface StaffDTO {
  id?: number;
  fullName: string;
  cnic: string;
  dateOfBirth: string; // LocalDate format: YYYY-MM-DD
  contactNumber: string;
  email?: string;
  address?: string;
  designation: StaffDesignation;
  salaryStructureId?: number;
}

export interface Staff extends StaffDTO {
  id: number;
  active?: boolean;
  joiningDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// =====================
// SALARY STRUCTURE TYPES
// =====================
export interface SalaryStructureDTO {
  id?: number;
  name: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  tax: number;
}

export interface SalaryStructure extends SalaryStructureDTO {
  id: number;
}

// =====================
// PAYROLL TYPES
// =====================
export interface PayrollRequestDTO {
  staffId: number;
  periodStart: string; // LocalDate format: YYYY-MM-DD
  periodEnd: string;
  remarks?: string;
}

export interface Payroll {
  id: number;
  staff: Staff;
  periodStart: string;
  periodEnd: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  remarks?: string;
  processedAt?: string;
}

// =====================
// FEE PLAN TYPES
// =====================
export interface FeePlanRequest {
  name: string;
  feeHeadIds: number[];
  monthly: boolean;
}

export interface FeePlan {
  id: number;
  name: string;
  feeHeads: FeeHead[];
  monthly: boolean;
}

// =====================
// FEE HEAD TYPES
// =====================
export interface FeeHead {
  id?: number;
  name: string;
  amount: number;
  active?: boolean;
  admissionOnly?: boolean;
}

// =====================
// PAYMENT TYPES
// =====================
export interface PaymentRequest {
  studentId: number;
  feePlanId: number;
  amountPaid: number;
  discount?: number;
}

export interface Payment {
  id: number;
  student: Student;
  amountPaid: number;
  discount: number;
  paymentDate: string;
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
}

// =====================
// LEDGER TYPES
// =====================
export interface LedgerEntry {
  id: number;
  student: Student;
  totalDue: number;
  totalPaid: number;
  balance: number;
  transactions?: LedgerTransaction[];
}

export interface LedgerTransaction {
  id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

// =====================
// VOUCHER TYPES
// =====================
export interface Voucher {
  id?: number;
  student?: Student;
  studentId?: number;
  month?: string;
  dueDate?: string;
  totalAmount: number;
  lateFee?: number;
  status?: VoucherStatus;
  createdAt?: string;
  paidAt?: string;
}

// =====================
// REPORT & FILTER TYPES
// =====================
export interface AdmissionReportFilters {
  className?: string;
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  className?: string;
  status?: string;
  type?: string;
}

// =====================
// DASHBOARD TYPES
// =====================
export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalRevenue: number;
  pendingFees: number;
  monthlyCollection: number;
  newAdmissions: number;
}

// =====================
// AUTH TYPES
// =====================
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    name: string;
  };
}

// =====================
// LEGACY TYPES (for backward compatibility with existing components)
// =====================
export interface FeeTransaction {
  id: string;
  studentId: string;
  grNumber: string;
  studentName: string;
  voucherNumber: string;
  date: string;
  feeHeads: {
    name: string;
    amount: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  discount: number;
  lateFee: number;
  balance: number;
  paymentMethod: "cash" | "bank" | "online";
  status: "paid" | "partial" | "pending";
  receivedBy?: string;
  remarks?: string;
}

export interface FeeVoucher {
  id: string;
  voucherNumber: string;
  studentId: string;
  grNumber: string;
  studentName: string;
  class: string;
  section: string;
  month: string;
  year: string;
  dueDate: string;
  issueDate: string;
  feeHeads: {
    name: string;
    amount: number;
  }[];
  totalAmount: number;
  status: "pending" | "paid" | "overdue";
}

export interface StudentLedgerEntry {
  id: string;
  date: string;
  description: string;
  voucherNumber?: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  designation: string;
  month: string;
  year: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "pending" | "processed" | "paid";
  paidDate?: string;
}

export interface FeeConfiguration {
  feeHeads: FeeHead[];
  lateFeePercentage: number;
  dueDateDay: number;
  discountRules: {
    type: string;
    percentage: number;
    description: string;
  }[];
}

// Designation options for UI dropdowns
export type DesignationType =
  | "Teacher"
  | "Senior Teacher"
  | "Principal"
  | "Vice Principal"
  | "Admin Staff"
  | "Lab Assistant"
  | "Librarian"
  | "Accountant"
  | "Clerk"
  | "Peon"
  | "Guard"
  | "Manager";

export const DESIGNATION_OPTIONS: DesignationType[] = [
  "Teacher",
  "Senior Teacher",
  "Principal",
  "Vice Principal",
  "Admin Staff",
  "Lab Assistant",
  "Librarian",
  "Accountant",
  "Clerk",
  "Peon",
  "Guard",
  "Manager",
];

// Backend designation mapping for API calls
export const STAFF_DESIGNATION_MAP: Record<DesignationType, StaffDesignation> =
  {
    Teacher: "TEACHER",
    "Senior Teacher": "TEACHER",
    Principal: "PRINCIPAL",
    "Vice Principal": "VICE_PRINCIPAL",
    "Admin Staff": "ADMIN",
    "Lab Assistant": "OTHER",
    Librarian: "LIBRARIAN",
    Accountant: "ACCOUNTANT",
    Clerk: "ADMIN",
    Peon: "PEON",
    Guard: "SECURITY",
    Manager: "ADMIN",
  };

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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
  type: "payment" | "admission" | "voucher" | "staff";
}
