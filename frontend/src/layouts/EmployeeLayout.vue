<template>
  <div class="employee-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3>Employee Portal</h3>
      </div>
      
      <ul class="nav-menu">
        <li>
          <router-link to="/employee/dashboard" class="nav-link">
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/employee/profile" class="nav-link">
            My Profile
          </router-link>
        </li>
        <li>
          <router-link to="/employee/attendance" class="nav-link">
            Attendance
          </router-link>
        </li>
        <li>
          <router-link to="/employee/leaves" class="nav-link">
            Leave Requests
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
  name: 'EmployeeLayout',
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
.employee-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #3498db;
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

.nav-menu li {
  margin-bottom: 10px;
}

.nav-link {
  display: block;
  padding: 10px;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #2980b9;
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
  background: #e74c3c;
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
