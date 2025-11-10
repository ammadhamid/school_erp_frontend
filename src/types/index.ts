// Centralized type definitions

export interface Student {
  id: string;
  grNumber: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  fatherCnic: string;
  motherCnic: string;
  bFormNumber: string;
  dob: string;
  class: string;
  section: string;
  group?: string;
  rollNumber: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  status: 'active' | 'inactive' | 'left';
  admissionDate: string;
  photo?: string;
}

export interface Staff {
  id: string;
  staffId: string;
  name: string;
  cnic: string;
  dob: string;
  phone: string;
  email?: string;
  address?: string;
  designation: string;
  department?: string;
  joiningDate: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'active' | 'inactive';
  photo?: string;
}

export interface FeeHead {
  id: string;
  name: string;
  amount: number;
  applicableClass?: string;
  mandatory: boolean;
  description?: string;
}

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
  paymentMethod: 'cash' | 'bank' | 'online';
  status: 'paid' | 'partial' | 'pending';
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
  status: 'pending' | 'paid' | 'overdue';
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
  status: 'pending' | 'processed' | 'paid';
  paidDate?: string;
}

export interface FeeConfiguration {
  feeHeads: FeeHead[];
  lateFeePercentage: number;
  dueDateDay: number; // day of month
  discountRules: {
    type: string;
    percentage: number;
    description: string;
  }[];
}

export type DesignationType = 'Teacher' | 'Senior Teacher' | 'Principal' | 'Vice Principal' | 
  'Admin Staff' | 'Lab Assistant' | 'Librarian' | 'Accountant' | 'Clerk' | 'Peon' | 'Guard' | 'Manager';

export const DESIGNATION_OPTIONS: DesignationType[] = [
  'Teacher',
  'Senior Teacher',
  'Principal',
  'Vice Principal',
  'Admin Staff',
  'Lab Assistant',
  'Librarian',
  'Accountant',
  'Clerk',
  'Peon',
  'Guard',
  'Manager',
];
