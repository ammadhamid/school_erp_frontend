# Spring Boot Backend Integration - Complete Guide

**Frontend integrated with:** https://github.com/ali-nasir7/abc_school

## Quick Start

1. Set your backend URL in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

2. Start your Spring Boot backend on port 8080
3. Start this frontend with `npm run dev`

## CORS Configuration (Required)

Add this to your Spring Boot application:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## API Endpoints Reference

### Authentication `/api/auth/*`
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/auth/login` | Login | `{ username, password }` |
| POST | `/api/auth/logout` | Logout | - |
| GET | `/api/auth/verify` | Verify token | - |

**Login Response:**
```json
{ "token": "jwt-token", "user": { "id": 1, "username": "admin", "role": "ADMIN", "name": "Admin" } }
```

---

### Students `/api/students/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students/create` | Create new student |
| GET | `/api/students/{id}` | Get student by ID |
| GET | `/api/students/gr/{grNumber}` | Get by GR number |
| GET | `/api/students/search?q={query}` | Search students |
| PUT | `/api/students/student/{id}/status?status={status}` | Update status |
| POST | `/api/students/{studentId}/fee-plan/{feePlanId}` | Assign fee plan |
| GET | `/api/students/student/{studentId}/due` | Get due amount |
| GET | `/api/students/admissions/report?start=&end=&className=` | Admission report |
| POST | `/api/students/{id}/admission-voucher` | Generate voucher PDF |

**StudentDTO:**
```json
{
  "fullName": "Ahmed Ali Khan",
  "fatherName": "Ali Khan",
  "motherName": "Fatima Khan",
  "fatherCnic": "42101-1234567-1",
  "motherCnic": "42101-7654321-2",
  "dateOfBirth": "2010-05-15",
  "className": "10",
  "section": "A",
  "groupName": "Science",
  "rollNumber": 1,
  "parentContact1": "0300-1234567",
  "parentContact2": "0321-7654321",
  "address": "House 123, Street 5, Islamabad",
  "bFormNumber": "B-2020-001234",
  "previousSchool": "ABC School",
  "admissionDate": "2025-01-15",
  "studentStatus": "ACTIVE",
  "feePlanId": 1
}
```

**Student Status Enum:** `ACTIVE`, `INACTIVE`, `GRADUATED`, `TRANSFERRED`, `SUSPENDED`

---

### Staff `/api/staff/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/staff/create` | Create staff |
| GET | `/api/staff/{id}` | Get by ID |
| PUT | `/api/staff/{id}` | Update staff |
| GET | `/api/staff/active` | List active staff |
| DELETE | `/api/staff/{id}` | Deactivate staff |

**StaffDTO:**
```json
{
  "fullName": "Muhammad Hussain",
  "cnic": "42101-3456789-1",
  "dateOfBirth": "1985-03-10",
  "contactNumber": "0300-3456789",
  "email": "hussain@school.edu",
  "address": "Address here",
  "designation": "TEACHER",
  "salaryStructureId": 1
}
```

**Designation Enum:** `TEACHER`, `PRINCIPAL`, `VICE_PRINCIPAL`, `ADMIN`, `ACCOUNTANT`, `LIBRARIAN`, `PEON`, `SECURITY`, `CLEANER`, `OTHER`

---

### Salary Structure `/api/staff/salary-structure/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/staff/salary-structure` | Create |
| PUT | `/api/staff/salary-structure/{id}` | Update |
| GET | `/api/staff/salary-structure` | List all |

**SalaryStructureDTO:**
```json
{ "name": "Teacher Level 1", "basicPay": 50000, "allowances": 10000, "deductions": 3000, "tax": 2000 }
```

---

### Payroll `/api/staff/payroll/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/staff/payroll/process` | Process payroll |
| GET | `/api/staff/payroll/{id}` | Get by ID |
| GET | `/api/staff/payroll/staff/{staffId}` | Staff history |
| GET | `/api/staff/payroll/all` | List all |
| GET | `/api/staff/payroll/{id}/slip` | Download PDF slip |

**PayrollRequestDTO:**
```json
{ "staffId": 1, "periodStart": "2025-01-01", "periodEnd": "2025-01-31", "remarks": "January salary" }
```

---

### Fee Heads `/api/fees/head/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fees/head` | Create fee head |
| GET | `/api/fees/head` | List all |
| PUT | `/api/fees/head/{id}` | Update |
| DELETE | `/api/fees/head/{id}` | Delete |

**FeeHead:**
```json
{ "name": "Tuition Fee", "amount": 5000, "isMonthly": true, "isActive": true, "description": "Monthly tuition", "applicableClass": "All" }
```

---

### Payments `/api/fees/payment/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fees/payment` | Make payment |
| GET | `/api/fees/payment/student/{studentId}` | Student payments |

**PaymentRequest:**
```json
{ "studentId": 1, "feePlanId": 1, "amountPaid": 7000, "discount": 500 }
```

---

### Ledger `/api/ledger/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ledger/student/{studentId}` | Student ledger |
| GET | `/api/ledger/all` | All ledgers |

**LedgerEntry Response:**
```json
{
  "id": 1,
  "student": { "id": 1, "fullName": "Ahmed" },
  "totalDue": 50000,
  "totalPaid": 35000,
  "balance": 15000,
  "transactions": [
    { "id": 1, "date": "2025-01-15", "description": "Fee", "debit": 8000, "credit": 8000, "balance": 0 }
  ]
}
```

---

### Vouchers `/api/vouchers/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vouchers/unpaid` | List unpaid |
| POST | `/api/vouchers/` | Create voucher |
| POST | `/api/vouchers/{id}/mark-paid` | Mark as paid |
| GET | `/api/vouchers/{id}/pdf` | Download PDF |
| POST | `/api/vouchers/apply-late-fees` | Apply late fees |

**Voucher Status Enum:** `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`

---

### Dashboard `/api/dashboard/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get statistics |
| GET | `/api/dashboard/activities` | Recent activities |

**DashboardStats Response:**
```json
{
  "totalStudents": 150,
  "totalStaff": 25,
  "totalRevenue": 5000000,
  "pendingFees": 250000,
  "monthlyCollection": 450000,
  "newAdmissions": 12
}
```

---

### Reports `/api/reports/*`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/students` | Student report |
| POST | `/api/reports/financial` | Financial report |
| POST | `/api/reports/staff` | Staff report |
| GET | `/api/reports/generate?type={type}` | Download PDF |

---

## Authentication Flow

1. User logs in via `/login` page
2. Backend returns JWT token in response
3. Token stored in `localStorage` as `authToken`
4. All API calls include `Authorization: Bearer {token}` header
5. On 401 response, redirect to login

## Error Response Format

```json
{ "message": "Error description", "code": "ERROR_CODE", "details": {} }
```

## PDF Generation

- Voucher PDF: `GET /api/vouchers/{id}/pdf`
- Salary Slip: `GET /api/staff/payroll/{id}/slip`
- Admission Voucher: `POST /api/students/{id}/admission-voucher`

All return `application/pdf` content type.

---

## Frontend Pages → API Mapping

| Page | APIs Used |
|------|-----------|
| Login | `authApi.login` |
| Dashboard | `dashboardApi.getStats`, `dashboardApi.getRecentActivities` |
| Students | `studentApi.search`, `studentApi.updateStatus` |
| Add Student | `studentApi.create`, `studentApi.generateAdmissionVoucher` |
| Staff | `staffApi.getActive`, `staffApi.create`, `staffApi.deactivate` |
| Fee Collection | `studentApi.getByGrNumber`, `feeHeadApi.getAll`, `feeHeadApi.makePayment` |
| Student Ledger | `studentApi.search`, `ledgerApi.getByStudent` |
| Fee Vouchers | `voucherApi.getUnpaid`, `voucherApi.markPaid`, `voucherApi.getPdf` |
| Fee Configuration | `feeHeadApi.getAll`, `feeHeadApi.create`, `feeHeadApi.delete` |
| Payroll | `staffApi.getActive`, `payrollApi.process`, `payrollApi.generateSlip` |
| Admissions | `studentApi.getAdmissionReport`, `studentApi.generateAdmissionVoucher` |
| Reports | `reportApi.studentReport`, `reportApi.financialReport`, `reportApi.generate` |
