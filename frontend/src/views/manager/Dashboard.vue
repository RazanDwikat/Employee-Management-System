<template>
  <div class="manager-dashboard">
    <h1>Manager Dashboard</h1>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ManagerDashboard',
  setup() {
    const stats = ref({
      teamMembers: 0,
      pendingLeaves: 0,
      attendanceRate: 0
    })
    
    const recentActivities = ref([])
    
    onMounted(() => {
      // TODO: Fetch actual data from API
      stats.value = {
        teamMembers: 12,
        pendingLeaves: 3,
        attendanceRate: 94
      }
      
      recentActivities.value = [
        { id: 1, time: '2 hours ago', text: 'John Doe submitted leave request' },
        { id: 2, time: '4 hours ago', text: 'Jane Smith marked attendance' },
        { id: 3, time: '1 day ago', text: 'Team meeting scheduled for tomorrow' }
      ]
    })
    
    return {
      stats,
      recentActivities
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
</style>
