<template>
  <div class="admin-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      
      <ul class="nav-menu">
        <li>
          <router-link to="/admin/dashboard" class="nav-link">
            <i class="icon">Dashboard</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/users" class="nav-link">
            <i class="icon">Users</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/departments" class="nav-link">
            <i class="icon">Departments</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/leave-types" class="nav-link">
            <i class="icon">Leave Types</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/leave-requests" class="nav-link">
            <i class="icon">Leave Requests</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/work-schedules" class="nav-link">
            <i class="icon">Work Schedules</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/payroll-rules" class="nav-link">
            <i class="icon">Payroll Rules</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/salary-management" class="nav-link">
            <i class="icon">Salary Management</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/reports" class="nav-link">
            <i class="icon">Reports</i>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/profile" class="nav-link">
            <i class="icon">Profile</i>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <main class="main-content">
      <header class="top-bar">
        <div class="user-info">
          <span>Welcome, {{ authStore.user?.name }}</span>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </header>
      
      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminLayout',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const handleLogout = () => {
      authStore.logout()
      router.push('/login')
    }
    
    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f1f5f9 100%);
}

.sidebar {
  width: 250px;
  background: #3d7d73;
  color: white;
  padding: 20px;
  border-right: 1px solid #2e6359;
  box-shadow: 2px 0 4px rgba(0,0,0,0.02);
}

.sidebar-header h3 {
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: 400;
  color: white;
}

.nav-menu {
  list-style: none;
  padding: 0;
}

.nav-menu li {
  margin-bottom: 10px;
}

.nav-link {
  display: block;
  padding: 12px 15px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #2e6359;
  color: white;
}

.main-content {
  flex: 1;
  background: transparent;
}

.top-bar {
  background: #3d7d73;
  padding: 15px 30px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid #2e6359;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
  font-weight: 500;
}

.logout-btn {
  background: #FFE2E2;
  color: #2c3e50;
  border: 1px solid #F6F6F6;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #F6F6F6;
  transform: translateY(-1px);
}

.content-area {
  padding: 30px;
}
</style>
