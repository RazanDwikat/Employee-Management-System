<template>
  <div class="employee-attendance">
    <!-- Page Header -->
    <PageHeader 
      title="Attendance" 
      subtitle="Track your daily attendance and history" 
    />
    
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading attendance data..." />
    
    <!-- Attendance Content -->
    <div v-else class="attendance-content">
      <!-- Today's Attendance -->
      <BaseCard variant="default" hoverable class="today-attendance-card">
        <template #header>
          <h3 class="card-title">Today's Attendance</h3>
        </template>
        
        <div class="attendance-status">
          <div class="status-display">
            <div class="status-icon" :class="getStatusIconClass(todayAttendance?.status)">
              {{ getStatusIcon(todayAttendance?.status) }}
            </div>
            <div class="status-info">
              <h4 class="status-title">{{ getStatusText(todayAttendance?.status) }}</h4>
              <p class="status-date">{{ formatDate(new Date()) }}</p>
            </div>
          </div>
          
          <div class="time-display">
            <div class="time-item">
              <span class="time-label">Check In</span>
              <span class="time-value" :class="{ 'success': todayAttendance?.check_in }">
                {{ todayAttendance?.check_in ? formatTime(todayAttendance.check_in) : '--:--' }}
              </span>
            </div>
            <div class="time-item">
              <span class="time-label">Check Out</span>
              <span class="time-value" :class="{ 'success': todayAttendance?.check_out }">
                {{ todayAttendance?.check_out ? formatTime(todayAttendance.check_out) : '--:--' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="attendance-actions">
          <AppButton
            @click="handleCheckIn"
            variant="primary"
            :loading="checkingIn"
            :disabled="!!(todayAttendance?.check_in) || checkingIn"
            icon="🕐"
          >
            Check In
          </AppButton>
          
          <AppButton
            @click="handleCheckOut"
            variant="secondary"
            :loading="checkingOut"
            :disabled="!todayAttendance?.check_in || !!todayAttendance?.check_out || checkingOut"
            icon="🕑"
          >
            Check Out
          </AppButton>
        </div>
      </BaseCard>
      
      <!-- Attendance History -->
      <BaseCard variant="default" hoverable class="attendance-history-card">
        <template #header>
          <div class="history-header">
            <h3 class="history-title">Attendance History</h3>
            
            <!-- Filters -->
            <div class="history-filters">
              <FormSelect
                :model-value="filters.month"
                :options="monthOptions"
                placeholder="All Months"
                @update:model-value="(value) => updateFilters('month', value)"
                @change="loadAttendanceHistory"
              />
              
              <FormSelect
                :model-value="filters.year"
                :options="yearOptions"
                placeholder="All Years"
                @update:model-value="(value) => updateFilters('year', value)"
                @change="loadAttendanceHistory"
              />
            </div>
          </div>
        </template>
        
        <!-- Attendance List -->
        <div class="attendance-list">
          <EmptyState
            v-if="attendanceHistory.length === 0"
            icon="📅"
            message="No attendance records found"
          />
          
          <div v-else v-for="record in attendanceHistory" :key="record.id" class="attendance-item">
            <div class="attendance-date">
              <div class="date-badge">
                {{ formatDate(record.date) }}
              </div>
            </div>
            
            <div class="attendance-details">
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <StatusBadge :status="record.status" />
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Check In:</span>
                <span class="detail-value" :class="{ 'success': record.check_in }">
                  {{ record.check_in ? formatTime(record.check_in) : '--:--' }}
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Check Out:</span>
                <span class="detail-value" :class="{ 'success': record.check_out }">
                  {{ record.check_out ? formatTime(record.check_out) : '--:--' }}
                </span>
              </div>
              
              <div v-if="record.check_in && record.check_out" class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">
                  {{ calculateDuration(record.check_in, record.check_out) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <Pagination
          v-if="pagination.total > pagination.per_page"
          :current-page="pagination.current_page"
          :last-page="pagination.last_page"
          @page-change="loadAttendanceHistory"
        />
      </BaseCard>
      
      <!-- Attendance Statistics -->
      <BaseCard variant="default" hoverable class="attendance-stats-card">
        <template #header>
          <h3 class="stats-title">Monthly Statistics</h3>
        </template>
        
        <div class="stats-grid">
          <div class="stat-item present">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <p class="stat-number">{{ stats.present }}</p>
              <p class="stat-label">Days Present</p>
            </div>
          </div>
          
          <div class="stat-item late">
            <div class="stat-icon">⏰</div>
            <div class="stat-content">
              <p class="stat-number">{{ stats.late }}</p>
              <p class="stat-label">Late Arrivals</p>
            </div>
          </div>
          
          <div class="stat-item absent">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <p class="stat-number">{{ stats.absent }}</p>
              <p class="stat-label">Days Absent</p>
            </div>
          </div>
          
          <div class="stat-item percentage">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <p class="stat-number">{{ stats.percentage }}%</p>
              <p class="stat-label">Attendance Rate</p>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- Success/Error Messages -->
      <AppMessage
        v-if="message"
        :type="messageType"
        :text="message"
      />
    </div>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useEmployeeStore } from '@/stores/employeeStore'
import BaseCard from '../../components/common/BaseCard.vue'
import PageHeader from '../../components/common/PageHeader.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'
import AppButton from '../../components/common/AppButton.vue'
import FormSelect from '../../components/common/FormSelect.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import Pagination from '../../components/common/Pagination.vue'
import AppMessage from '../../components/common/AppMessage.vue'

export default {
  name: 'EmployeeAttendance',
  components: {
    BaseCard,
    PageHeader,
    LoadingSpinner,
    AppButton,
    FormSelect,
    EmptyState,
    StatusBadge,
    Pagination,
    AppMessage
  },
  setup() {
    const employeeStore = useEmployeeStore()
    
    // Lifecycle
    onMounted(() => {
      employeeStore.initializeAttendance()
    })
    
    return {
      // Store state as computed properties for reactivity
      loading: computed(() => employeeStore.loading.attendance),
      checkingIn: computed(() => employeeStore.loading.checkIn),
      checkingOut: computed(() => employeeStore.loading.checkOut),
      todayAttendance: computed(() => employeeStore.todayAttendance),
      attendanceHistory: computed(() => employeeStore.attendanceHistory),
      stats: computed(() => employeeStore.attendanceStats),
      pagination: computed(() => employeeStore.attendancePagination),
      filters: computed(() => employeeStore.attendanceFilters),
      message: computed(() => employeeStore.message),
      messageType: computed(() => employeeStore.messageType),
      
      // Store getters as computed properties
      months: computed(() => employeeStore.months),
      availableYears: computed(() => employeeStore.availableYears),
      monthOptions: computed(() => employeeStore.monthOptions),
      yearOptions: computed(() => employeeStore.yearOptions),
      
      // Store actions
      handleCheckIn: employeeStore.handleCheckIn,
      handleCheckOut: employeeStore.handleCheckOut,
      loadAttendanceHistory: employeeStore.loadAttendanceHistory,
      formatDate: employeeStore.formatDate,
      formatTime: employeeStore.formatTime,
      getStatusClass: employeeStore.getAttendanceStatusClass,
      getStatusIcon: employeeStore.getStatusIcon,
      getStatusIconClass: employeeStore.getStatusIconClass,
      getStatusText: employeeStore.getStatusText,
      calculateDuration: employeeStore.calculateDuration,
      updateFilters: employeeStore.updateAttendanceFilters
    }
  }
}
</script>

<style scoped>
.employee-attendance {
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
  border-top: 4px solid #3d7d73;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Today's Attendance Card */
.today-attendance-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px 0;
}

.attendance-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 24px;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  font-size: 48px;
  padding: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.success {
  background: #d1fae5;
  color: #065f46;
}

.status-icon.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-icon.danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-icon.pending {
  background: #f3f4f6;
  color: #5f6368;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.status-date {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
}

.time-display {
  display: flex;
  gap: 32px;
}

.time-item {
  text-align: center;
}

.time-label {
  display: block;
  font-size: 12px;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.time-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.time-value.success {
  color: #10b981;
}

/* Action Buttons */
.attendance-actions {
  display: flex;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e8eaed;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-check-in {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-check-in:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-check-out {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-check-out:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-secondary {
  background: white;
  color: #5f6368;
  border: 2px solid #e8eaed;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #dadce0;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 12px;
  min-width: auto;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-icon {
  font-size: 18px;
  margin-right: 8px;
}

/* Attendance History Card */
.attendance-history-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.history-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.history-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e8eaed;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

/* Attendance List */
.attendance-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attendance-item {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  gap: 20px;
}

.attendance-item:hover {
  border-color: #dadce0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attendance-date {
  flex-shrink: 0;
}

.date-badge {
  background: #e8f0fe;
  color: #3d7d73;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  min-width: 100px;
}

.attendance-details {
  flex: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  color: #5f6368;
  min-width: 80px;
}

.detail-value {
  color: #2c3e50;
}

.detail-value.success {
  color: #10b981;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.text-green-600 {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.text-yellow-600 {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.text-red-600 {
  background: #fee2e2;
  color: #991b1b;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #5f6368;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Attendance Statistics Card */
.attendance-stats-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item.present {
  background: #d1fae5;
}

.stat-item.late {
  background: #fef3c7;
}

.stat-item.absent {
  background: #fee2e2;
}

.stat-item.percentage {
  background: #e8f0fe;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 12px;
  color: #5f6368;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8eaed;
}

.page-info {
  font-size: 14px;
  color: #5f6368;
}

/* Messages */
.message {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .employee-attendance {
    padding: 16px;
  }
  
  .today-attendance-card,
  .attendance-history-card,
  .attendance-stats-card {
    padding: 20px;
  }
  
  .attendance-status {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-display {
    width: 100%;
    justify-content: space-between;
  }
  
  .attendance-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .history-filters {
    width: 100%;
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .attendance-item {
    flex-direction: column;
    gap: 16px;
  }
  
  .attendance-date {
    align-self: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
