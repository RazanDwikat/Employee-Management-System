# Employee Management System (EMS)

A robust Laravel RESTful API designed to manage employees, departments, attendance, leaves, and payroll within an organization.

---

## Overview

This system helps organizations to:
- Manage employee data efficiently  
- Track attendance and working hours  
- Handle leave requests and approvals  
- Automate salary calculations (bonuses & deductions)  
- Generate reports and analytics  

---

## Features

### User & Role Management
- Role-based system: Admin, Manager, Employee
- Secure authentication & authorization
- User status management (active / inactive)

### Employee Management
- Full CRUD operations for employees
- Assign employees to departments
- Track employment status (active, resigned, terminated)

### Department Management
- Create and manage departments
- Assign managers to departments
- View employee distribution

### Attendance Tracking
- Check-in / Check-out system
- Late detection based on work schedule
- Overtime calculation
- Daily attendance tracking

### Leave Management
- Apply for leave requests
- Approve / reject leave requests
- Track leave types and statuses

### Payroll System
- Base salary management
- Automatic calculations:
  - Late penalties
  - Absence deductions
  - Overtime bonuses
- Manual adjustments (bonus / deduction)
- Monthly salary generation

### Reports & Analytics
- Employee reports
- Department distribution
- Attendance analytics
- Salary insights
- Leave statistics

### Search & Filters
- Dynamic filtering for users, attendance, and leaves

---

## Tech Stack

- Backend: Laravel (PHP 8+)
- Database: MySQL
- ORM: Eloquent
- Authentication: JWT

---

## Installation

### 1. Clone repository
```bash
---

## API Documentation
[View API Docs] https://documenter.getpostman.com/view/49027821/2sBXqFM2jB

git clone <repo-url>
cd employee_management_system
