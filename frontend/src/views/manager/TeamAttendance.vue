<template>
  <div class="attendance-page">
    <div class="page-header">
      <h1>Team Attendance</h1>
      <p class="page-description">View and manage attendance records for your department team</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="date-filter">Date:</label>
        <input 
          type="date" 
          id="date-filter"
          v-model="filters.date"
          @change="loadTeamAttendance"
          class="filter-input"
        />
      </div>
      
      <div class="filter-group">
        <label for="status-filter">Status:</label>
        <select 
          id="status-filter"
          v-model="filters.status"
          @change="loadTeamAttendance"
          class="filter-select"
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="half_day">Half Day</option>
        </select>
      </div>
      
      <button @click="resetFilters" class="btn btn-secondary">
        Reset Filters
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon present">👥</div>
        <div class="stat-content">
          <h3>{{ stats.totalEmployees }}</h3>
          <p>Total Employees</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon present">✅</div>
        <div class="stat-content">
          <h3>{{ stats.present }}</h3>
          <p>Present Today</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon absent">❌</div>
        <div class="stat-content">
          <h3>{{ stats.absent }}</h3>
          <p>Absent Today</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon late">⏰</div>
        <div class="stat-content">
          <h3>{{ stats.late }}</h3>
          <p>Late Today</p>
        </div>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="table-section">
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading attendance data...</p>
      </div>
      
      <div v-else-if="attendanceRecords.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No attendance records found</h3>
        <p>Try adjusting your filters or select a different date</p>
      </div>
      
      <div v-else class="table-container">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Working Hours</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in attendanceRecords" :key="record.id">
              <td>
                <div class="employee-info">
                  <div class="employee-avatar">
                    {{ getInitials(record.employee?.user?.name) }}
                  </div>
                  <div class="employee-details">
                    <div class="employee-name">{{ record.employee?.user?.name }}</div>
                    <div class="employee-id">{{ record.employee?.employee_number }}</div>
                  </div>
                </div>
              </td>
              <td>{{ formatDate(record.date) }}</td>
              <td>{{ record.check_in_time || '-' }}</td>
              <td>{{ record.check_out_time || '-' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(record.status)]">
                  {{ record.status || 'Not marked' }}
                </span>
              </td>
              <td>{{ calculateWorkingHours(record) || '-' }}</td>
              <td>
                <span class="notes-text">{{ record.notes || '-' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.total > pagination.per_page" class="pagination">
        <button
          @click="loadTeamAttendance(pagination.current_page - 1)"
          :disabled="pagination.current_page <= 1"
          class="btn btn-secondary btn-sm"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </span>
        
        <button
          @click="loadTeamAttendance(pagination.current_page + 1)"
          :disabled="pagination.current_page >= pagination.last_page"
          class="btn btn-secondary btn-sm"
        >
          Next
        </button>
      </div>
    </div>
    
    <!-- Success/Error Messages -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import managerService from '../../services/managerService'

export default {
  name: 'TeamAttendance',
  setup() {
    // Reactive data
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('success')
    const attendanceRecords = ref([])
    const pagination = ref({
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0
    })
    
    const filters = ref({
      date: new Date().toISOString().split('T')[0], // Today's date
      status: ''
    })
    
    const stats = ref({
      totalEmployees: 0,
      present: 0,
      absent: 0,
      late: 0
    })
    
    // Methods
    const loadTeamAttendance = async (page = 1) => {
      try {
        loading.value = true
        
        const params = {
          page,
          ...filters.value
        }
        
        const response = await managerService.getTeamAttendance(params)
        attendanceRecords.value = response.data || []
        
        if (response.meta) {
          pagination.value = response.meta
        }
        
        // Calculate stats
        calculateStats()
        
      } catch (error) {
        console.error('Error loading team attendance:', error)
        showMessage('Error loading team attendance', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const calculateStats = () => {
      const today = filters.value.date
      const todayRecords = attendanceRecords.value.filter(record => record.date === today)
      
      stats.value = {
        totalEmployees: new Set(attendanceRecords.value.map(r => r.employee_id)).size,
        present: todayRecords.filter(r => r.status === 'present').length,
        absent: todayRecords.filter(r => r.status === 'absent').length,
        late: todayRecords.filter(r => r.status === 'late').length
      }
    }
    
    const resetFilters = () => {
      filters.value = {
        date: new Date().toISOString().split('T')[0],
        status: ''
      }
      loadTeamAttendance()
    }
    
    const exportData = () => {
      // TODO: Implement export functionality
      showMessage('Export feature coming soon!', 'info')
    }
    
    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }
    
    const getInitials = (name) => {
      if (!name) return 'U'
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const getStatusClass = (status) => {
      const statusClasses = {
        present: 'status-present',
        absent: 'status-absent',
        late: 'status-late',
        half_day: 'status-half-day'
      }
      return statusClasses[status] || 'status-default'
    }
    
    const calculateWorkingHours = (record) => {
      if (!record.check_in_time || !record.check_out_time) return null
      
      const checkIn = new Date(`${record.date} ${record.check_in_time}`)
      const checkOut = new Date(`${record.date} ${record.check_out_time}`)
      const hours = (checkOut - checkIn) / (1000 * 60 * 60)
      
      return hours.toFixed(2)
    }
    
    // Lifecycle
    onMounted(() => {
      loadTeamAttendance()
    })
    
    return {
      loading,
      message,
      messageType,
      attendanceRecords,
      pagination,
      filters,
      stats,
      loadTeamAttendance,
      resetFilters,
      exportData,
      getInitials,
      formatDate,
      getStatusClass,
      calculateWorkingHours
    }
  }
}
</script>

<style scoped>
.attendance-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-description {
  color: #6b7280;
  font-size: 16px;
}

.filters-section {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stat-icon.present {
  background: #dcfce7;
}

.stat-icon.absent {
  background: #fee2e2;
}

.stat-icon.late {
  background: #fef3c7;
}

.stat-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-content p {
  color: #6b7280;
  font-size: 14px;
}

.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.table-container {
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th,
.attendance-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.attendance-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.employee-name {
  font-weight: 500;
  color: #1f2937;
}

.employee-id {
  font-size: 12px;
  color: #6b7280;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-present {
  background: #dcfce7;
  color: #166534;
}

.status-absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-late {
  background: #fef3c7;
  color: #92400e;
}

.status-half-day {
  background: #e0e7ff;
  color: #3730a3;
}

.status-default {
  background: #f3f4f6;
  color: #6b7280;
}

.notes-text {
  font-size: 14px;
  color: #6b7280;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.page-info {
  color: #6b7280;
  font-size: 14px;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 500;
  z-index: 1000;
  min-width: 250px;
}

.message.success {
  background: #10b981;
  color: white;
}

.message.error {
  background: #ef4444;
  color: white;
}

.message.info {
  background: #3b82f6;
  color: white;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-outline {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
