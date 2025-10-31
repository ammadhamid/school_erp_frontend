// Mock data for testing without backend

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
  designation: string;
  joiningDate: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'active' | 'inactive';
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
}

// Generate 50+ students
export const mockStudents: Student[] = [
  {
    id: '1',
    grNumber: 'GR-2025-0001',
    fullName: 'Ahmed Ali Khan',
    fatherName: 'Ali Khan',
    motherName: 'Fatima Khan',
    fatherCnic: '42101-1234567-1',
    motherCnic: '42101-7654321-2',
    bFormNumber: 'B-2020-001234',
    dob: '2010-05-15',
    class: '10',
    section: 'A',
    group: 'Science',
    rollNumber: '01',
    phone: '0300-1234567',
    alternatePhone: '0321-7654321',
    address: 'House 123, Street 5, Sector F-8, Islamabad',
    status: 'active',
    admissionDate: '2020-04-01',
  },
  {
    id: '2',
    grNumber: 'GR-2025-0002',
    fullName: 'Sara Malik',
    fatherName: 'Malik Abdullah',
    motherName: 'Ayesha Malik',
    fatherCnic: '42101-2345678-1',
    motherCnic: '42101-8765432-2',
    bFormNumber: 'B-2019-002345',
    dob: '2011-08-20',
    class: '9',
    section: 'B',
    group: 'Computer Science',
    rollNumber: '05',
    phone: '0300-2345678',
    address: 'Flat 45, Building C, Blue Area, Islamabad',
    status: 'active',
    admissionDate: '2019-04-01',
  },
  // Add more students...
  ...Array.from({ length: 48 }, (_, i) => ({
    id: `${i + 3}`,
    grNumber: `GR-2025-${String(i + 3).padStart(4, '0')}`,
    fullName: `Student ${i + 3}`,
    fatherName: `Father ${i + 3}`,
    motherName: `Mother ${i + 3}`,
    fatherCnic: `42101-${String(1000000 + i).slice(0, 7)}-1`,
    motherCnic: `42101-${String(2000000 + i).slice(0, 7)}-2`,
    bFormNumber: `B-202${i % 5}-${String(i + 1000).padStart(6, '0')}`,
    dob: `201${i % 3}-0${(i % 12) + 1}-${(i % 28) + 1}`,
    class: `${5 + (i % 8)}`,
    section: ['A', 'B', 'C'][i % 3],
    group: i % 3 === 0 ? 'Science' : i % 3 === 1 ? 'Arts' : 'Commerce',
    rollNumber: String((i % 30) + 1).padStart(2, '0'),
    phone: `0300-${String(1000000 + i).slice(0, 7)}`,
    address: `House ${i + 1}, Street ${(i % 10) + 1}, Sector ${['F-8', 'G-9', 'I-10'][i % 3]}, Islamabad`,
    status: (i % 15 === 0 ? 'left' : i % 20 === 0 ? 'inactive' : 'active') as 'active' | 'inactive' | 'left',
    admissionDate: `202${i % 5}-04-01`,
  })),
];

// Generate 10+ staff
export const mockStaff: Staff[] = [
  {
    id: '1',
    staffId: 'ST-001',
    name: 'Muhammad Hussain',
    cnic: '42101-3456789-1',
    dob: '1985-03-10',
    phone: '0300-3456789',
    designation: 'Principal',
    joiningDate: '2015-01-01',
    basicPay: 80000,
    allowances: 20000,
    deductions: 5000,
    netSalary: 95000,
    status: 'active',
  },
  {
    id: '2',
    staffId: 'ST-002',
    name: 'Asma Shahid',
    cnic: '42101-4567890-2',
    dob: '1990-07-15',
    phone: '0301-4567890',
    designation: 'Senior Teacher',
    joiningDate: '2018-08-01',
    basicPay: 50000,
    allowances: 10000,
    deductions: 3000,
    netSalary: 57000,
    status: 'active',
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `${i + 3}`,
    staffId: `ST-${String(i + 3).padStart(3, '0')}`,
    name: `Teacher ${i + 3}`,
    cnic: `42101-${String(5000000 + i).slice(0, 7)}-1`,
    dob: `198${i % 5}-0${(i % 12) + 1}-${(i % 28) + 1}`,
    phone: `0301-${String(5000000 + i).slice(0, 7)}`,
    designation: ['Teacher', 'Lab Assistant', 'Admin Staff'][i % 3],
    joiningDate: `201${5 + (i % 5)}-01-01`,
    basicPay: 40000 + i * 2000,
    allowances: 5000 + i * 500,
    deductions: 2000 + i * 100,
    netSalary: 43000 + i * 2400,
    status: 'active' as 'active' | 'inactive',
  })),
];

// Generate transactions
export const mockTransactions: FeeTransaction[] = [
  {
    id: '1',
    studentId: '1',
    grNumber: 'GR-2025-0001',
    studentName: 'Ahmed Ali Khan',
    voucherNumber: 'VOC-2025-0001',
    date: '2025-01-15',
    feeHeads: [
      { name: 'Tuition Fee', amount: 5000 },
      { name: 'Transport Fee', amount: 2000 },
      { name: 'Exam Fee', amount: 1000 },
    ],
    totalAmount: 8000,
    paidAmount: 8000,
    discount: 0,
    lateFee: 0,
    balance: 0,
    paymentMethod: 'cash',
    status: 'paid',
  },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `${i + 2}`,
    studentId: `${(i % 20) + 1}`,
    grNumber: `GR-2025-${String((i % 20) + 1).padStart(4, '0')}`,
    studentName: `Student ${(i % 20) + 1}`,
    voucherNumber: `VOC-2025-${String(i + 2).padStart(4, '0')}`,
    date: `2025-01-${String((i % 30) + 1).padStart(2, '0')}`,
    feeHeads: [
      { name: 'Tuition Fee', amount: 5000 },
      { name: 'Transport Fee', amount: 2000 },
    ],
    totalAmount: 7000,
    paidAmount: i % 3 === 0 ? 7000 : i % 3 === 1 ? 5000 : 0,
    discount: i % 5 === 0 ? 500 : 0,
    lateFee: i % 7 === 0 ? 200 : 0,
    balance: i % 3 === 0 ? 0 : i % 3 === 1 ? 2000 : 7000,
    paymentMethod: ['cash', 'bank', 'online'][i % 3] as 'cash' | 'bank' | 'online',
    status: (i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partial' : 'pending') as 'paid' | 'partial' | 'pending',
  })),
];
