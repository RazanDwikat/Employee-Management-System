<template>
  <div class="employee-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Employee Dashboard</h1>
      <p class="page-subtitle">Welcome back, {{ authStore.user?.name }}!</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading.dashboard" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
    
    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <BaseCard variant="default" hoverable class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">📅</div>
            <div class="stat-details">
              <h3 class="stat-title">Days Present</h3>
              <p class="stat-number">{{ stats.present_days }}</p>
              <span class="stat-period">This month</span>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard variant="default" hoverable class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">⏰</div>
            <div class="stat-details">
              <h3 class="stat-title">Late Days</h3>
              <p class="stat-number">{{ stats.late_days }}</p>
              <span class="stat-period">This month</span>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard variant="default" hoverable class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">❌</div>
            <div class="stat-details">
              <h3 class="stat-title">Absent Days</h3>
              <p class="stat-number">{{ stats.absent_days }}</p>
              <span class="stat-period">This month</span>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard variant="default" hoverable class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🏖️</div>
            <div class="stat-details">
              <h3 class="stat-title">Leaves This Month</h3>
              <p class="stat-number">{{ stats.leaves_this_month }}</p>
              <span class="stat-period">Days taken</span>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="action-buttons">
          <button @click="handleCheckIn" 
                  class="action-btn check-in" 
                  :disabled="todayAttendance?.check_in || loading.checkIn">
            <span class="btn-icon">🕐</span>
            Check In
          </button>
          
          <button @click="handleCheckOut" 
                  class="action-btn check-out" 
                  :disabled="!todayAttendance?.check_in || todayAttendance?.check_out || loading.checkOut">
            <span class="btn-icon">🕑</span>
            Check Out
          </button>
          
          <router-link to="/employee/leaves" class="action-btn leave-request">
            <span class="btn-icon">📝</span>
            Request Leave
          </router-link>
          
          <router-link to="/employee/profile" class="action-btn profile">
            <span class="btn-icon">👤</span>
            Update Profile
          </router-link>
        </div>
      </div>
      
      <!-- Today's Status -->
      <div class="today-status">
        <h2 class="section-title">Today's Status</h2>
        <div class="status-card">
          <div class="status-info">
            <div class="status-item">
              <span class="status-label">Date:</span>
              <span class="status-value">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Check In:</span>
              <span class="status-value" :class="{ 'success': todayAttendance?.check_in }">
                {{ todayAttendance?.check_in ? formatTime(todayAttendance.check_in) : 'Not checked in' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Check Out:</span>
              <span class="status-value" :class="{ 'success': todayAttendance?.check_out }">
                {{ todayAttendance?.check_out ? formatTime(todayAttendance.check_out) : 'Not checked out' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Status:</span>
              <span class="status-value" :class="getAttendanceStatusClass(todayAttendance?.status)">
                {{ todayAttendance?.status || 'Not recorded' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2 class="section-title">Recent Activity</h2>
        <div class="activity-list">
          <div v-if="recentLeaves.length === 0" class="empty-state">
            <p>No recent leave requests</p>
          </div>
          <div v-else v-for="leave in recentLeaves.slice(0, 3)" :key="leave.id" class="activity-item">
            <div class="activity-icon">📝</div>
            <div class="activity-content">
              <p class="activity-text">Leave request submitted</p>
              <p class="activity-details">
                {{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}
              </p>
              <span class="activity-status" :class="getLeaveStatusClass(leave.status)">
                {{ leave.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import employeeService from '../../services/employeeService'
import BaseCard from '../../components/common/BaseCard.vue'

export default {
  name: 'EmployeeDashboard',
  components: {
    BaseCard
  },
  setup() {
    const authStore = useAuthStore()
    
    // Reactive data
    const loading = ref({
      dashboard: false,
      checkIn: false,
      checkOut: false
    })
    
    const stats = ref({
      present_days: 0,
      late_days: 0,
      absent_days: 0,
      leaves_this_month: 0,
      today_status: 'not_checked_in',
      total_work_days: 0
    })
    
    const todayAttendance = ref(null)
    const recentLeaves = ref([])
    
    // Methods
    const loadDashboardData = async () => {
      try {
        loading.value.dashboard = true
        
        // Load dashboard stats
        const dashboardData = await employeeService.getDashboardStats()
        stats.value = dashboardData.stats
        
        // Load today's attendance
        todayAttendance.value = await employeeService.getTodayAttendance()
        
        // Load recent leaves
        const leavesData = await employeeService.getLeaves({ limit: 5 })
        recentLeaves.value = leavesData.data || []
        
                
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        loading.value.dashboard = false
      }
    }
    
    const handleCheckIn = async () => {
      try {
        loading.value.checkIn = true
        const response = await employeeService.checkIn()
        todayAttendance.value = response.attendance
        
        // Refresh stats
        await loadDashboardData()
        
      } catch (error) {
        console.error('Error checking in:', error)
      } finally {
        loading.value.checkIn = false
      }
    }
    
    const handleCheckOut = async () => {
      try {
        loading.value.checkOut = true
        const response = await employeeService.checkOut()
        todayAttendance.value = response.attendance
        
        // Refresh stats
        await loadDashboardData()
        
      } catch (error) {
        console.error('Error checking out:', error)
      } finally {
        loading.value.checkOut = false
      }
    }
    
    const formatDate = (date) => {
      return employeeService.formatDate(date)
    }
    
    const formatTime = (time) => {
      return employeeService.formatTime(time)
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0)
    }
    
    const getAttendanceStatusClass = (status) => {
      return employeeService.getAttendanceStatusColor(status)
    }
    
    const getLeaveStatusClass = (status) => {
      return employeeService.getLeaveStatusColor(status)
    }
    
    // Lifecycle
    onMounted(() => {
      loadDashboardData()
    })
    
    return {
      authStore,
      loading,
      stats,
      todayAttendance,
      recentLeaves,
      handleCheckIn,
      handleCheckOut,
      formatDate,
      formatTime,
      formatCurrency,
      getAttendanceStatusClass,
      getLeaveStatusClass
    }
  }
}
</script>

<style scoped>
.employee-dashboard {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #5f6368;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e8eaed;
  border-top: 4px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card .stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 48px;
  opacity: 0.8;
}

.stat-details {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.stat-period {
  font-size: 12px;
  color: #5f6368;
}

.stat-card.present .stat-icon { color: #10b981; }
.stat-card.leave .stat-icon { color: #3b82f6; }
.stat-card.pending .stat-icon { color: #f59e0b; }
.stat-card.salary .stat-icon { color: #8b5cf6; }

/* Section Titles */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.check-in {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-btn.check-in:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.check-out {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.action-btn.check-out:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-btn.leave-request {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.action-btn.leave-request:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.profile {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.action-btn.profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-icon {
  font-size: 18px;
}

/* Today's Status */
.today-status {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.status-card {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 20px;
}

.status-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: 500;
  color: #5f6368;
}

.status-value {
  font-weight: 600;
  color: #2c3e50;
}

.status-value.success {
  color: #10b981;
}

/* Recent Activity */
.recent-activity {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-icon {
  font-size: 24px;
  opacity: 0.7;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.activity-details {
  font-size: 14px;
  color: #5f6368;
  margin: 0 0 8px 0;
}

.activity-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.activity-status.text-green-600 {
  background: #d1fae5;
  color: #065f46;
}

.activity-status.text-yellow-600 {
  background: #fef3c7;
  color: #92400e;
}

.activity-status.text-red-600 {
  background: #fee2e2;
  color: #991b1b;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #5f6368;
}

/* Responsive Design */
@media (max-width: 768px) {
  .employee-dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .status-info {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
