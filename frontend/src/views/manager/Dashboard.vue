<template>
  <div class="manager-dashboard">
    <h1>Manager Dashboard</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
    
    <!-- Dashboard Content -->
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Team Members</h3>
          <p class="stat-number">{{ stats.teamMembers }}</p>
        </div>
        <div class="stat-card">
          <h3>Pending Leave Requests</h3>
          <p class="stat-number">{{ stats.pendingLeaves }}</p>
        </div>
        <div class="stat-card">
          <h3>This Month Attendance</h3>
          <p class="stat-number">{{ stats.attendanceRate }}%</p>
        </div>
      </div>
    
    <div class="recent-activities">
        <h3>Recent Activities</h3>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <span class="activity-time">{{ activity.time }}</span>
            <span class="activity-text">{{ activity.text }}</span>
          </div>
        </div>
      </div>
      
      <!-- Success/Error Messages -->
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useManagerStore } from '@/stores/managerStore'

export default {
  name: 'ManagerDashboard',
  setup() {
    const managerStore = useManagerStore()
    
    onMounted(() => {
      // Load dashboard stats from store
      managerStore.loadDashboardStats()
    })
    
    return {
      // Store state as computed properties for reactivity
      stats: computed(() => managerStore.dashboardStats),
      loading: computed(() => managerStore.loading.dashboard),
      message: computed(() => managerStore.message),
      messageType: computed(() => managerStore.messageType),
      
      // Recent activities (static data for now)
      recentActivities: [
        { id: 1, time: '2 hours ago', text: 'John Doe submitted leave request' },
        { id: 2, time: '4 hours ago', text: 'Jane Smith marked attendance' },
        { id: 3, time: '1 day ago', text: 'Team meeting scheduled for tomorrow' }
      ]
    }
  }
}
</script>

<style scoped>
.manager-dashboard {
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #27ae60;
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
}

.stat-card h3 {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #27ae60;
}

.recent-activities {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recent-activities h3 {
  margin-bottom: 15px;
  color: #27ae60;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-left: 3px solid #27ae60;
  background: #f8f9fa;
}

.activity-time {
  color: #666;
  font-size: 12px;
  min-width: 80px;
}

.activity-text {
  color: #333;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Messages */
.message {
  padding: 16px 20px;
  border-radius: 8px;
  margin-top: 20px;
  font-weight: 500;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
</style>
