# NexusHR – AI-Enabled Enterprise HR & Workforce Intelligence Platform

NexusHR is a modern Enterprise Human Resource Management System (HRMS) built using Java 21, Spring Boot, PostgreSQL, Spring Security (JWT), and React. 
The application streamlines HR operations such as employee management, attendance tracking, leave management, payroll processing, and secure authentication with role-based access control.

---

## Features

### Authentication & Authorization
- User Registration
- Secure Login using JWT
- BCrypt Password Encryption
- Role-Based Access Control (ADMIN, HR, EMPLOYEE)
- Update User Profile
- Change Password
- Disable User Account (Admin Only)
- Update User Role (Admin Only)
- Current Logged-in User API (`/me`)

---

### Employee Management
- Add Employee
- Update Employee
- Delete Employee
- Search Employee
- Get Employee by ID
- Get Employee by Email
- Employee-Department Mapping

---

### Department Management
- Create Department
- Update Department
- Delete Department
- View All Departments
- Department-wise Employee Relationship

---

### Attendance Management
- Mark Attendance
- Update Attendance
- Get Attendance by Employee
- Get Attendance by Date
- Get Attendance by Date Range
- Working Hours Calculation

---

### Leave Management
- Apply Leave
- Update Leave Status
- Approve / Reject Leave
- Leave History
- Leave Duration Calculation

---

### Payroll Management
- Generate Monthly Payroll
- Salary Calculation
- Attendance Integration
- Leave Deduction
- Net Salary Calculation
- Monthly Payroll Records

---

## Technology Stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- Maven
- PostgreSQL
- Lombok
- Jakarta Validation

## Database

PostgreSQL

---


## Project Structure

```
src
├── config
├── controller
├── dto
├── entity
├── repository
├── security
├── service
└── exception
```

---

## API Modules

```
Authentication
Employee
Department
Attendance
Leave
Payroll
```

---

## Authentication APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |
| GET | /api/auth/me | Current Logged-in User |
| PUT | /api/auth/profile | Update Profile |
| PUT | /api/auth/change-password | Change Password |
| PUT | /api/auth/disable/{id} | Disable User |
| PUT | /api/auth/role/{id} | Update User Role |

---

## Employee APIs

- Create Employee
- Update Employee
- Delete Employee
- Get Employee
- Search Employee

---

## Department APIs

- Create Department
- Update Department
- Delete Department
- Get Department
- Get All Departments

---

## Attendance APIs

- Mark Attendance
- Update Attendance
- Get Attendance
- Get Attendance by Date
- Get Attendance by Date Range

---

## Leave APIs

- Apply Leave
- Update Leave
- Approve Leave
- Reject Leave
- Leave History

---

## Payroll APIs

- Generate Payroll
- Get Payroll
- Monthly Payroll Report

---

## Security

- JWT Authentication
- BCrypt Password Encryption
- Role-Based Authorization
- Stateless Authentication
- Protected REST APIs
- Custom Exception Handling
- Custom 401 & 403 Responses

---

## Upcoming Features

- Performance Management
- Leave Balance
- Dashboard Analytics
- Payslip PDF Generation
- Notification Module
- React Dashboard
- Docker Support
- Redis Caching
- Spring AI Workforce Insights
- CI/CD Pipeline

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/chandan3kumar/NexusHR-_AI-Enabled-Enterprise-HR-Workforce-Intelligence-Platform.git
```

## Me:-

**Chandan Kumar**

Java Backend Developer

GitHub:
https://github.com/chandan3kumar

LinkedIn:
https://www.linkedin.com/in/chandan-kumar-160a12269

portfolio:
https://chandan-portfolio-a8o2.vercel.app/
