<template>
  <div class="employee-layout">
    <!-- Mobile Sidebar -->
    <MobileSidebar :is-open="isMobileSidebarOpen" @close="closeMobileSidebar">
      <li>
        <router-link to="/employee/dashboard" class="nav-link" @click="closeMobileSidebar">
          Dashboard
        </router-link>
      </li>
      <li>
        <router-link to="/employee/profile" class="nav-link" @click="closeMobileSidebar">
          My Profile
        </router-link>
      </li>
      <li>
        <router-link to="/employee/attendance" class="nav-link" @click="closeMobileSidebar">
          Attendance
        </router-link>
      </li>
      <li>
        <router-link to="/employee/leaves" class="nav-link" @click="closeMobileSidebar">
          Leave Requests
        </router-link>
      </li>
      <li>
        <router-link to="/employee/salaries" class="nav-link" @click="closeMobileSidebar">
          My Salaries
        </router-link>
      </li>
    </MobileSidebar>
    
    <!-- Desktop Sidebar -->
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
        <li>
          <router-link to="/employee/salaries" class="nav-link">
            My Salaries
          </router-link>
        </li>
      </ul>
    </nav>
    
    <main class="main-content">
      <header class="top-bar">
        <button class="menu-toggle" @click="toggleMobileSidebar">
          ☰
        </button>
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
import MobileSidebar from '../components/MobileSidebar.vue'
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'EmployeeLayout',
  components: {
    MobileSidebar
  },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const isMobileSidebarOpen = ref(false)
    
    const handleLogout = () => {
      authStore.logout()
      router.push('/login')
    }
    
    const toggleMobileSidebar = () => {
      isMobileSidebarOpen.value = !isMobileSidebarOpen.value
    }
    
    const closeMobileSidebar = () => {
      isMobileSidebarOpen.value = false
    }
    
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        isMobileSidebarOpen.value = false
      }
    }
    
    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      authStore,
      handleLogout,
      isMobileSidebarOpen,
      toggleMobileSidebar,
      closeMobileSidebar
    }
  }
}
</script>

<style scoped>
.employee-layout {
  display: flex;
  min-height: 100vh;
}

/* Mobile Menu Toggle */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  color: #333;
}

/* Desktop Sidebar */
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
  background: rgba(255, 255, 255, 0.1);
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
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c82333;
}

.content-area {
  padding: 30px;
}
</style>
