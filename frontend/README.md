# Employee Management System - Frontend

Vue.js frontend for the Employee Management System with Laravel backend.

## Features

- **Role-based Authentication**: Admin, Manager, and Employee roles
- **Responsive Design**: Modern UI with Vue 3 and Vite
- **State Management**: Pinia for global state
- **Routing**: Vue Router with role-based navigation
- **API Integration**: Axios for Laravel API communication

## Project Structure

```
frontend/
src/
  components/        # Reusable Vue components
  layouts/          # Layout components for different roles
    - AdminLayout.vue
    - ManagerLayout.vue
    - EmployeeLayout.vue
  router/           # Vue Router configuration
  services/         # API services
    - authService.js
  stores/           # Pinia stores
    - auth.js
  views/            # Page components
    auth/           # Authentication pages
      - Login.vue
    admin/          # Admin pages
      - Dashboard.vue
      - UserManagement.vue
      - DepartmentManagement.vue
    manager/        # Manager pages
      - Dashboard.vue
    employee/       # Employee pages
      - Dashboard.vue
  App.vue           # Root component
  main.js           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 16+
- Laravel backend running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to http://localhost:3000

### API Configuration

The frontend is configured to connect to Laravel backend at `http://localhost:8000/api`. 
Make sure your Laravel backend is running and CORS is configured properly.

## Authentication Flow

1. Users login via `/login` page
2. JWT token is stored in localStorage
3. Users are redirected to role-specific dashboard:
   - Admin: `/admin/dashboard`
   - Manager: `/manager/dashboard`
   - Employee: `/employee/dashboard`

## Role-Based Access

- **Admin**: Full system access - user management, departments, reports
- **Manager**: Team management, schedule, leave approvals
- **Employee**: Personal profile, attendance, leave requests

## Build for Production

```bash
npm run build
```

## Dependencies

- Vue 3
- Vue Router 4
- Pinia (state management)
- Axios (HTTP client)
- Vite (build tool)

## Development Notes

- API endpoints are configured in `src/services/authService.js`
- Authentication state is managed in `src/stores/auth.js`
- Role-based routing is configured in `src/router/index.js`
- Mock data is included for demonstration until backend is fully connected
