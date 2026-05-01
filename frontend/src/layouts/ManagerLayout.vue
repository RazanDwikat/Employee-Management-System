<template>
  <div class="manager-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3>Manager Panel</h3>
      </div>
      
      <ul class="nav-menu">
       <!-- Employee Functions -->
       <li class="nav-section">
          <span class="nav-section-title">My Work</span>
        </li>
        <li>
          <router-link to="/manager/dashboard" class="nav-link">
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/manager/profile" class="nav-link">
            My Profile
          </router-link>
        </li>
        <li>
          <router-link to="/manager/attendance" class="nav-link">
            Attendance
          </router-link>
        </li>
        <li>
          <router-link to="/manager/leaves" class="nav-link">
            Leave Requests
          </router-link>
        </li>
        <li>
          <router-link to="/manager/salaries" class="nav-link">
            My Salaries
          </router-link>
        </li>
        
        <!-- Manager Functions -->
        <li class="nav-section">
          <span class="nav-section-title">Team Management</span>
        </li>
        <li>
          <router-link to="/manager/employees" class="nav-link">
            Team Members
          </router-link>
        </li>
        <li>
          <router-link to="/manager/leave-management" class="nav-link">
            Leave Management
          </router-link>
        </li>
        <li>
          <router-link to="/manager/team-attendance" class="nav-link">
            Team Attendance
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
  name: 'ManagerLayout',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    
    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.manager-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #3d7d73;
  color: white;
  padding: 20px;
}

.sidebar-header h3 {
  margin-bottom: 30px;
  font-size: 20px;
}

.nav-menu {
  list-style: none;
  padding: 0;
}

.nav-section {
  margin: 20px 0 10px 0;
}

.nav-section-title {
  display: block;
  padding: 5px 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.nav-menu li {
  margin-bottom: 2px;
}

.nav-link {
  display: block;
  padding: 10px;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
  font-size: 14px;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #3d7d73;
}

.main-content {
  flex: 1;
  background: #f5f5f5;
}

.top-bar {
  background: white;
  padding: 15px 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: #faeae9;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.content-area {
  padding: 30px;
}
</style>
