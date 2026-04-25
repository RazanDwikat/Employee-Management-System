<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-number">{{ stats.totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Departments</h3>
        <p class="stat-number">{{ stats.totalDepartments }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Employees</h3>
        <p class="stat-number">{{ stats.activeEmployees }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AdminDashboard',
  setup() {
    const stats = ref({
      totalUsers: 0,
      totalDepartments: 0,
      activeEmployees: 0
    })
    
    onMounted(() => {
      // TODO: Fetch actual stats from API
      stats.value = {
        totalUsers: 45,
        totalDepartments: 8,
        activeEmployees: 42
      }
    })
    
    return {
      stats
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
}
</style>
