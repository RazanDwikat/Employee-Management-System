<template>
  <div class="employee-dashboard">
    <h1>Employee Dashboard</h1>
    
    <div class="welcome-card">
      <h2>Welcome back, {{ authStore.user?.name }}!</h2>
      <p>Here's your attendance and leave information</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Days Present This Month</h3>
        <p class="stat-number">{{ stats.daysPresent }}</p>
      </div>
      <div class="stat-card">
        <h3>Leave Balance</h3>
        <p class="stat-number">{{ stats.leaveBalance }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Requests</h3>
        <p class="stat-number">{{ stats.pendingRequests }}</p>
      </div>
    </div>
    
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="action-buttons">
        <router-link to="/employee/attendance" class="action-btn">
          Mark Attendance
        </router-link>
        <router-link to="/employee/leaves" class="action-btn">
          Request Leave
        </router-link>
        <router-link to="/employee/profile" class="action-btn">
          Update Profile
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'EmployeeDashboard',
  setup() {
    const authStore = useAuthStore()
    
    const stats = ref({
      daysPresent: 0,
      leaveBalance: 0,
      pendingRequests: 0
    })
    
    onMounted(() => {
      // TODO: Fetch actual data from API
      stats.value = {
        daysPresent: 18,
        leaveBalance: 12,
        pendingRequests: 1
      }
    })
    
    return {
      authStore,
      stats
    }
  }
}
</script>

<style scoped>
.employee-dashboard {
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #3498db;
}

.welcome-card {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: center;
}

.welcome-card h2 {
  margin-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #3498db;
}

.quick-actions {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quick-actions h3 {
  margin-bottom: 20px;
  color: #3498db;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  background: #3498db;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
}
</style>
