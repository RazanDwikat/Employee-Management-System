import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('../views/admin/UserManagement.vue')
        },
        {
          path: 'departments',
          name: 'DepartmentManagement',
          component: () => import('../views/admin/DepartmentManagement.vue')
        },
        {
          path: 'leave-types',
          name: 'LeaveTypeManagement',
          component: () => import('../views/admin/LeaveTypeManagement.vue')
        },
        {
          path: 'leave-requests',
          name: 'LeaveRequestsManagement',
          component: () => import('../views/admin/LeaveRequestsManagement.vue')
        },
        {
          path: 'profile',
          name: 'AdminProfile',
          component: () => import('../views/admin/Profile.vue')
        }
      ]
    },
    {
      path: '/manager',
      component: () => import('../layouts/ManagerLayout.vue'),
      meta: { requiresAuth: true, role: 'manager' },
      children: [
        {
          path: '',
          redirect: '/manager/dashboard'
        },
        {
          path: 'dashboard',
          name: 'ManagerDashboard',
          component: () => import('../views/manager/Dashboard.vue')
        }
      ]
    },
    {
      path: '/employee',
      component: () => import('../layouts/EmployeeLayout.vue'),
      meta: { requiresAuth: true, role: 'employee' },
      children: [
        {
          path: '',
          redirect: '/employee/dashboard'
        },
        {
          path: 'dashboard',
          name: 'EmployeeDashboard',
          component: () => import('../views/employee/Dashboard.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.role && authStore.user?.role !== to.meta.role) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
