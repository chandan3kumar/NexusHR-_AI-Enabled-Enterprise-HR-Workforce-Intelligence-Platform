# NexusHR – AI-Enabled Enterprise HR & Workforce Intelligence Platform

NexusHR is a modern Enterprise Human Resource Management System built using Java 21, Spring Boot, PostgreSQL, Spring Security JWT, and React. It streamlines employee management, attendance, leave, leave balance, payroll, performance review, dashboard analytics, payslip generation, and secure role-based access control.

## Features

### Authentication & Authorization
- User Registration and Login
- JWT Authentication
- BCrypt Password Encryption
- Role-Based Access Control: ADMIN, HR, EMPLOYEE
- Update Profile
- Change Password
- Disable User Account
- Prevent Self Disable
- Update User Role
- Current Logged-in User API `/me`
- Custom 401 and 403 Responses

### Employee Management
- Add, Update, Delete Employee
- Search Employee
- Get Employee by ID and Email
- Employee-Department Mapping

### Department Management
- Create, Update, Delete Department
- View All Departments
- Department-wise Employee Relationship

### Attendance Management
- Check-in / Check-out
- Get Attendance by Employee
- Get Attendance by Date
- Get Attendance by Date Range
- Working Hours Calculation

### Leave Management
- Apply Leave
- Approve / Reject Leave
- Leave History
- Leave Duration Calculation

### Leave Balance
- Create Leave Balance
- View Employee Leave Balance
- Update Total Leaves
- Auto Deduct Leave Balance on Approval

### Payroll Management
- Generate Monthly Payroll
- Attendance and Leave Based Salary Calculation
- Weekend Exclusion
- Bonus and Deduction Handling
- Payroll Approval Workflow
- Net Salary Calculation
- Monthly Payroll Records

### Performance Management
- Add Performance Review
- Update Review
- Delete Review
- Employee-wise Review History
- Average Rating Calculation

### Dashboard Analytics
- Total Employees
- Active / Inactive Employees
- Total Departments
- Present Today
- Pending and Approved Leaves
- Monthly Payroll Summary
- Average Performance Rating

### Payslip PDF
- Generate Payslip PDF
- Download Approved Payroll Payslip

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
- OpenPDF

## Database

PostgreSQL

## Project Structure

```text
src
├── config
├── controller
├── dto
├── entity
├── repository
├── security
├── service
└── exception


## Me:-

Chandan Kumar
Java Backend Developer

GitHub: https://github.com/chandan3kumar
LinkedIn: https://www.linkedin.com/in/chandan-kumar-160a12269
Portfolio: https://chandan-portfolio-a8o2.vercel.app/
