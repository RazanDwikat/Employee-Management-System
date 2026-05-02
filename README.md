# Employee Management System (EMS)

A comprehensive Laravel RESTful API with Vue.js frontend designed to manage employees, departments, attendance, leaves, and payroll within an organization.

---

## 🚀 Overview

This modern employee management system helps organizations to:
- **Manage employee data efficiently** with intuitive interfaces
- **Track attendance and working hours** with automated calculations
- **Handle leave requests and approvals** through streamlined workflows
- **Automate salary calculations** including bonuses & deductions
- **Generate comprehensive reports and analytics** with real-time insights
- **Maintain departmental organization** with role-based access control

---

## ✨ Key Features

### 🔐 User & Role Management
- **Multi-role system**: Admin, Manager, Employee with specific permissions
- **Secure authentication**: JWT-based authentication with token management
- **User status management**: Active/inactive status tracking
- **Profile management**: Personal information and preferences

### 👥 Employee Management
- **Complete CRUD operations**: Create, read, update, delete employees
- **Department assignment**: Flexible employee-to-department mapping
- **Employment tracking**: Active, resigned, terminated status management
- **Search & filtering**: Advanced search with multiple criteria
- **Bulk operations**: Mass updates and data management

### 🏢 Department Management
- **Hierarchical structure**: Create and manage department hierarchy
- **Manager assignment**: Assign managers to specific departments
- **Employee distribution**: View and analyze department workforce
- **Department analytics**: Performance metrics per department

### ⏰ Attendance Tracking
- **Check-in/Check-out system**: Automated time tracking
- **Late detection**: Smart detection based on work schedules
- **Overtime calculation**: Automatic overtime computation
- **Daily attendance**: Comprehensive daily tracking
- **Monthly summaries**: Detailed monthly attendance reports
- **Work schedule management**: Flexible scheduling system

### 🏖️ Leave Management
- **Leave request system**: Easy-to-use leave application process
- **Approval workflow**: Multi-level approval process
- **Leave types**: Multiple leave categories (sick, vacation, etc.)
- **Leave balance tracking**: Automatic balance calculation
- **Leave history**: Complete leave record management

### 💰 Payroll System
- **Base salary management**: Flexible salary structure
- **Automated calculations**:
  - Late penalties based on attendance
  - Absence deductions with configurable rates
  - Overtime bonuses with multiple rates
- **Manual adjustments**: Custom bonuses and deductions
- **Monthly payroll generation**: Automated monthly processing
- **Payroll reports**: Detailed salary breakdowns

### 📊 Reports & Analytics
- **Real-time dashboards**: Interactive data visualization
- **Employee reports**: Comprehensive employee analytics
- **Department distribution**: Visual department analytics
- **Attendance insights**: Detailed attendance patterns
- **Salary analytics**: Compensation analysis and trends
- **Leave statistics**: Leave pattern analysis
- **Export functionality**: PDF and Excel report generation

### 🔍 Search & Filtering
- **Dynamic filtering**: Real-time filtering for all data
- **Advanced search**: Multi-criteria search functionality
- **Date range filtering**: Flexible date-based queries
- **Status-based filtering**: Filter by various status types

---

## 🛠 Tech Stack

### Backend
- **Framework**: Laravel 10+ (PHP 8+)
- **Database**: MySQL 8.0+
- **ORM**: Eloquent ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Laravel Form Request Validation
- **File Storage**: Laravel Storage System

### Frontend
- **Framework**: Vue.js 3 with Composition API
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **UI Components**: Custom component library
- **Charts**: Chart.js for data visualization
- **Styling**: Tailwind CSS with custom themes
- **Build Tool**: Vite

### Development Tools
- **Package Management**: Composer (PHP), npm (Node.js)
- **Documentation**: Postman API Documentation (https://documenter.getpostman.com/view/49027821/2sBXqFM2jB)

---


## 🚀 Installation

### Prerequisites
- PHP 8.0 or higher
- Composer
- Node.js 16+ and npm
- MySQL 8.0+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/RazanDwikat/Employee-Management-System.git
cd employee-management-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_DATABASE=employee_management
DB_USERNAME=root
DB_PASSWORD=your_password

# Run database migrations
php artisan migrate

# Start Laravel development server
php artisan serve
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start Vue.js development server
npm run dev
```


---

## 🔧 Configuration

### Environment Variables
Configure the following in your `.env` file:

```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=employee_management
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key





