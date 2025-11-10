# Spring Boot Backend Integration Guide

This document explains how to integrate your Spring Boot backend with this frontend application.

## Quick Setup

1. Set your backend URL in `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

2. All API calls are centralized in `src/services/api.ts`

## API Service Structure

The application uses a centralized API service layer (`src/services/api.ts`) with the following structure:

```typescript
// Generic API call handler with authentication
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T>

// Service modules
- studentApi
- staffApi
- feeApi
- payrollApi
- reportApi
- dashboardApi
- authApi
```

## Required Backend Endpoints

### Authentication
```
POST   /api/auth/login           - Login with credentials
POST   /api/auth/logout          - Logout
GET    /api/auth/verify          - Verify token
```

### Students
```
GET    /api/students             - Get all students
GET    /api/students/:id         - Get student by ID
POST   /api/students             - Create new student
PUT    /api/students/:id         - Update student
DELETE /api/students/:id         - Delete student
GET    /api/students/search?q=   - Search students
```

### Staff
```
GET    /api/staff                - Get all staff
GET    /api/staff/:id            - Get staff by ID
POST   /api/staff                - Create new staff
PUT    /api/staff/:id            - Update staff
DELETE /api/staff/:id            - Delete staff
```

### Fees
```
GET    /api/fees/configuration   - Get fee configuration
PUT    /api/fees/configuration   - Update fee configuration
POST   /api/fees/collect         - Collect fee
GET    /api/fees/ledger/:id      - Get student ledger
POST   /api/fees/voucher         - Generate voucher
GET    /api/fees/vouchers        - Get all vouchers
GET    /api/fees/transactions    - Get all transactions
```

### Payroll
```
GET    /api/payroll              - Get payroll (optional ?month=)
POST   /api/payroll/process      - Process payroll
POST   /api/payroll/slip         - Generate salary slip
```

### Reports
```
POST   /api/reports/generate     - Generate report
POST   /api/reports/students     - Student report
POST   /api/reports/financial    - Financial report
POST   /api/reports/staff        - Staff report
```

### Dashboard
```
GET    /api/dashboard/stats      - Get dashboard statistics
GET    /api/dashboard/activities - Get recent activities
```

## Request/Response Format

### Authentication
**Login Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "1",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Student
**Create Student Request:**
```json
{
  "grNumber": "GR-2025-0001",
  "fullName": "Ahmed Ali Khan",
  "fatherName": "Ali Khan",
  "motherName": "Fatima Khan",
  "fatherCnic": "42101-1234567-1",
  "motherCnic": "42101-7654321-2",
  "bFormNumber": "B-2020-001234",
  "dob": "2010-05-15",
  "class": "10",
  "section": "A",
  "group": "Science",
  "rollNumber": "01",
  "phone": "0300-1234567",
  "alternatePhone": "0321-7654321",
  "address": "House 123, Street 5, Islamabad",
  "status": "active",
  "admissionDate": "2020-04-01"
}
```

### Staff
**Create Staff Request:**
```json
{
  "name": "Muhammad Hussain",
  "cnic": "42101-3456789-1",
  "dob": "1985-03-10",
  "phone": "0300-3456789",
  "email": "hussain@school.edu",
  "address": "Address here",
  "designation": "Teacher",
  "department": "Science",
  "joiningDate": "2015-01-01",
  "basicPay": 50000,
  "allowances": 10000,
  "deductions": 3000,
  "netSalary": 57000,
  "status": "active"
}
```

### Fee Collection
**Collect Fee Request:**
```json
{
  "studentId": "1",
  "grNumber": "GR-2025-0001",
  "feeHeads": [
    { "name": "Tuition Fee", "amount": 5000 },
    { "name": "Transport Fee", "amount": 2000 }
  ],
  "totalAmount": 7000,
  "discount": 0,
  "lateFee": 0,
  "paymentMethod": "cash",
  "remarks": ""
}
```

## Error Handling

All API errors are automatically caught and logged. The frontend handles errors gracefully with toast notifications.

Backend should return errors in this format:
```json
{
  "message": "Error description here",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Authentication Flow

1. User logs in via `/login` page
2. Backend returns JWT token
3. Token is stored in `localStorage` as `authToken`
4. All subsequent API calls include token in `Authorization` header as `Bearer {token}`
5. On 401 responses, user is redirected to login

## State Management

The application uses React hooks for state management:
- `useState` for local component state
- API calls are made directly from components
- Loading and error states are handled in each component

## Using the API Service

### Example: Fetching Students
```typescript
import { studentApi } from '@/services/api';

// In your component
const fetchStudents = async () => {
  try {
    const students = await studentApi.getAll();
    setStudents(students);
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to fetch students',
      variant: 'destructive',
    });
  }
};
```

### Example: Creating Staff
```typescript
import { staffApi } from '@/services/api';

const createStaff = async (staffData) => {
  try {
    const newStaff = await staffApi.create(staffData);
    toast({
      title: 'Success',
      description: 'Staff member added successfully',
    });
    return newStaff;
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to add staff member',
      variant: 'destructive',
    });
  }
};
```

## Spring Boot CORS Configuration

Add this to your Spring Boot application:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173") // Vite dev server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Testing Without Backend

The application currently uses mock data from `src/lib/mockData.ts`. Once your backend is ready:

1. Remove mock data usage
2. Replace with actual API calls
3. Test each endpoint individually

## Type Definitions

All TypeScript types are defined in `src/types/index.ts`. Make sure your backend DTOs match these types.

## Next Steps

1. Set `VITE_API_BASE_URL` in `.env`
2. Implement required endpoints in Spring Boot
3. Test authentication flow
4. Replace mock data with API calls progressively
5. Handle edge cases and errors

## Support

For any integration issues, check:
1. Browser console for errors
2. Network tab for API calls
3. Backend logs for request/response details
