# Employee Management System (EMS) 🏢

## 📖 About The Project

Employee Management System is a comprehensive web application designed to help organizations manage their workforce efficiently. Built with modern technologies, this system provides a complete solution for employee administration, attendance tracking, leave management, and payroll processing.

### � What We Built
A full-stack application that enables companies to:
- Manage employee profiles and department assignments
- Track daily attendance with automated calculations
- Handle leave requests through digital workflows
- Process payroll with automated deductions and bonuses
- Generate comprehensive reports and analytics
- Maintain role-based access control for security

### � Technologies Used

#### Backend Stack
- **Laravel 10+** - Modern PHP framework for robust API development
- **MySQL 8.0** - Reliable database for data storage
- **JWT Authentication** - Secure token-based authentication system
- **Eloquent ORM** - Powerful database abstraction layer

#### Frontend Stack
- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Pinia** - Modern state management solution
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Chart.js** - Interactive data visualization library
- **Vite** - Fast build tool and development server

#### DevOps & Deployment
- **Docker & Docker Compose** - Containerization for consistent environments
- **Railway** - Cloud platform for production deployment
- **Nginx** - High-performance web server
- **Git** - Version control system

---

## 🌐 Live Application & Usage

### 🚀 Access The Application
**🔗 Live URL**: https://employee-management.up.railway.app

The application is deployed and running on Railway cloud platform with:
- ✅ SSL certificate enabled (HTTPS)
- ✅ Auto-scaling infrastructure
- ✅ Managed database
- ✅ CI/CD pipeline from GitHub

### 🔑 Default Login Accounts

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| **Admin** | razan@gmail.com | 123456 | Full system access, user management, reports |
| **Manager** | ahmed@example.com | 123456 | Department management, employee supervision |
| **Employee** | mohamed@example.com | 123456 | Personal profile, attendance, leave requests |

### � How To Use The System

#### Getting Started
1. **Open the App**: Click the live URL above
2. **Login**: Use any of the default accounts
3. **Explore**: Navigate through the dashboard

#### Key Workflows
- **👤 Admin**: Add employees, manage departments, generate reports
- **👨‍💼 Manager**: Approve leaves, monitor attendance, supervise team
- **👨‍💻 Employee**: Check attendance, request leave, view salary

#### Daily Operations
1. **Attendance**: Check-in when you arrive, check-out when you leave
2. **Leaves**: Submit leave requests and wait for approval
3. **Reports**: View analytics and export data
4. **Payroll**: Check monthly salary calculations

---

## 🐳 Docker Setup

### 🚀 Quick Docker Start
```bash
# Clone and run everything with Docker
git clone https://github.com/RazanDwikat/Employee-Management-System.git
cd Employee-Management-System
docker-compose up -d
```

### 📋 Docker Services
Our Docker setup includes three main services:

| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| **Database** | MySQL 8.0 | 3307 | Data storage |
| **Backend** | Laravel API | 8000 | REST API server |
| **Frontend** | Vue.js SPA | 3000 | User interface |

### 🔧 Docker Commands
```bash
# Start all services in background
docker-compose up -d

# View real-time logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers (if you make changes)
docker-compose up --build

# Access backend container
docker-compose exec backend bash

# Access database container
docker-compose exec db mysql -u dbuser -p
```

### 🗄️ Database Configuration
The Docker setup comes with pre-configured database:
- **Database Name**: `employee_management_system`
- **User**: `dbuser`
- **Password**: `userpassword`
- **Root Password**: `rootpassword`

### 🌐 Access Points
After running `docker-compose up -d`:
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:3307 (for external tools)

### 📝 Initial Data Setup
```bash
# After containers are running, seed the database
docker-compose exec backend php artisan db:seed --class=UserSeeder
```

---

## � Local Development Setup

If you prefer to develop locally without Docker:

### Prerequisites
- PHP 8.0+, Composer, Node.js 16+, MySQL 8.0+, Git

### Installation Steps
```bash
# 1. Clone repository
git clone https://github.com/RazanDwikat/Employee-Management-System.git
cd Employee-Management-System

# 2. Backend setup
cd backend
composer install
cp .env.example .env
php artisan key:generate

# 3. Configure .env file
DB_DATABASE=employee_management_system
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key

# 4. Database setup
php artisan migrate
php artisan db:seed --class=UserSeeder

# 5. Start backend
php artisan serve

# 6. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🐛 Troubleshooting

### Common Solutions
```bash
# Laravel issues
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Docker issues
docker-compose down
docker-compose up --build

# Frontend issues
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
- Verify MySQL service is running
- Check `.env` database credentials
- Ensure migrations are completed

---


**API Docs**: [Postman Documentation](https://documenter.getpostman.com/view/49027821/2sBXqFM2jB)

---





