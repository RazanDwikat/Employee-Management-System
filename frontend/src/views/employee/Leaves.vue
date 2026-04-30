<template>
  <div class="employee-leaves">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Leave Requests</h1>
      <p class="page-subtitle">Manage your leave requests and history</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading leave requests...</p>
    </div>
    
    <!-- Leave Content -->
    <div v-else class="leave-content">
      <!-- Leave Request Form -->
      <div class="leave-form-card">
        <h3 class="form-title">Submit Leave Request</h3>
        
        <form @submit.prevent="handleSubmitLeave" class="leave-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="leave_type_id" class="form-label">Leave Type</label>
              <select
                id="leave_type_id"
                v-model="leaveForm.leave_type_id"
                class="form-select"
                required
              >
                <option value="">Select leave type</option>
                <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="start_date" class="form-label">Start Date</label>
              <input
                id="start_date"
                v-model="leaveForm.start_date"
                type="date"
                class="form-input"
                :min="minDate"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="end_date" class="form-label">End Date</label>
              <input
                id="end_date"
                v-model="leaveForm.end_date"
                type="date"
                class="form-input"
                :min="leaveForm.start_date || minDate"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="start_time" class="form-label">Start Time (Optional)</label>
              <input
                id="start_time"
                v-model="leaveForm.start_time"
                type="time"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="end_time" class="form-label">End Time (Optional)</label>
              <input
                id="end_time"
                v-model="leaveForm.end_time"
                type="time"
                class="form-input"
              />
            </div>
            
            <div class="form-group full-width">
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                v-model="leaveForm.description"
                class="form-textarea"
                rows="4"
                placeholder="Provide a reason for your leave request..."
              ></textarea>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="submitting"
            >
              <span v-if="submitting" class="btn-loading">
                <div class="spinner"></div>
                Submitting...
              </span>
              <span v-else>Submit Request</span>
            </button>
            
            <button
              type="button"
              @click="handleReset"
              class="btn btn-secondary"
              :disabled="submitting"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      <!-- Leave History -->
      <div class="leave-history-card">
        <div class="history-header">
          <h3 class="history-title">Leave History</h3>
          
          <!-- Filters -->
          <div class="history-filters">
            <select v-model="filters.status" class="filter-select" @change="loadLeaves">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select v-model="filters.year" class="filter-select" @change="loadLeaves">
              <option value="">All Years</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Leave List -->
        <div class="leave-list">
          <div v-if="leaves.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>No leave requests found</p>
          </div>
          
          <div v-else v-for="leave in leaves" :key="leave.id" class="leave-item">
            <div class="leave-header">
              <div class="leave-type">
                <span class="type-badge">{{ leave.leave_type?.name || 'Leave' }}</span>
              </div>
              <div class="leave-status">
                <span class="status-badge" :class="getStatusClass(leave.status)">
                  {{ leave.status }}
                </span>
              </div>
            </div>
            
            <div class="leave-details">
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">
                  {{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}
                  <span v-if="leave.start_time && leave.end_time">
                    ({{ formatTime(leave.start_time) }} - {{ formatTime(leave.end_time) }})
                  </span>
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Submitted:</span>
                <span class="detail-value">{{ formatDate(leave.created_at) }}</span>
              </div>
              
              <div v-if="leave.description" class="detail-row">
                <span class="detail-label">Reason:</span>
                <span class="detail-value">{{ leave.description }}</span>
              </div>
            </div>
            
            <div class="leave-actions">
              <button
                v-if="leave.status === 'pending'"
                @click="handleCancelLeave(leave.id)"
                class="btn btn-danger btn-sm"
                :disabled="cancelling"
              >
                <span v-if="cancelling" class="btn-loading">
                  <div class="spinner"></div>
                  Canceling...
                </span>
                <span v-else>Cancel Request</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.total > pagination.per_page" class="pagination">
          <button
            @click="loadLeaves(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          
          <span class="page-info">
            Page {{ pagination.current_page }} of {{ pagination.last_page }}
          </span>
          
          <button
            @click="loadLeaves(pagination.current_page + 1)"
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import employeeService from '../../services/employeeService'

export default {
  name: 'EmployeeLeaves',
  setup() {
    // Reactive data
    const loading = ref(false)
    const submitting = ref(false)
    const cancelling = ref(false)
    const message = ref('')
    const messageType = ref('success')
    
    const leaves = ref([])
    const leaveTypes = ref([])
    const pagination = ref({
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0
    })
    
    const leaveForm = ref({
      leave_type_id: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      description: ''
    })
    
    const filters = ref({
      status: '',
      year: ''
    })
    
    // Computed properties
    const minDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })
    
    const availableYears = computed(() => {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - i)
    })
    
    // Methods
    const loadLeaveTypes = async () => {
      try {
        const response = await employeeService.getLeaveTypes()
        
        // Extract data from Laravel API response
        leaveTypes.value = response.data || []
      } catch (error) {
        console.error('Error loading leave types:', error)
      }
    }
    
    const loadLeaves = async (page = 1) => {
      try {
        loading.value = true
        
        const params = {
          page,
          ...filters.value
        }
        
        const response = await employeeService.getLeaves(params)
        leaves.value = response.data || []
        
        if (response.meta) {
          pagination.value = response.meta
        }
        
      } catch (error) {
        console.error('Error loading leaves:', error)
        showMessage('Error loading leave requests', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const handleSubmitLeave = async () => {
      try {
        submitting.value = true
        
        // Validate form
        if (!leaveForm.value.leave_type_id) {
          showMessage('Please select a leave type', 'error')
          return
        }
        
        if (!leaveForm.value.start_date || !leaveForm.value.end_date) {
          showMessage('Please select start and end dates', 'error')
          return
        }
        
        if (new Date(leaveForm.value.end_date) < new Date(leaveForm.value.start_date)) {
          showMessage('End date must be after start date', 'error')
          return
        }
        
        // Submit leave request
        await employeeService.submitLeave(leaveForm.value)
        
        // Reset form
        handleReset()
        
        // Reload leaves
        await loadLeaves()
        
        showMessage('Leave request submitted successfully!', 'success')
        
      } catch (error) {
        console.error('Error submitting leave:', error)
        showMessage(error.response?.data?.message || 'Error submitting leave request', 'error')
      } finally {
        submitting.value = false
      }
    }
    
    const handleCancelLeave = async (leaveId) => {
      if (!confirm('Are you sure you want to cancel this leave request?')) {
        return
      }
      
      try {
        cancelling.value = true
        
        await employeeService.cancelLeave(leaveId)
        
        // Reload leaves
        await loadLeaves()
        
        showMessage('Leave request cancelled successfully!', 'success')
        
      } catch (error) {
        console.error('Error cancelling leave:', error)
        showMessage(error.response?.data?.message || 'Error cancelling leave request', 'error')
      } finally {
        cancelling.value = false
      }
    }
    
    const handleReset = () => {
      leaveForm.value = {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        description: ''
      }
      message.value = ''
    }
    
    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }
    
    const formatDate = (dateString) => {
      return employeeService.formatDate(dateString)
    }
    
    const formatTime = (timeString) => {
      return employeeService.formatTime(timeString)
    }
    
    const getStatusClass = (status) => {
      return employeeService.getLeaveStatusColor(status)
    }
    
    // Lifecycle
    onMounted(() => {
      loadLeaveTypes()
      loadLeaves()
    })
    
    return {
      loading,
      submitting,
      cancelling,
      message,
      messageType,
      leaves,
      leaveTypes,
      pagination,
      leaveForm,
      filters,
      minDate,
      availableYears,
      handleSubmitLeave,
      handleCancelLeave,
      handleReset,
      loadLeaves,
      formatDate,
      formatTime,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.employee-leaves {
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

/* Leave Form Card */
.leave-form-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px 0;
}

/* Form Styles */
.leave-form {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #e8eaed;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
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
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3d7d73 0%, #478078 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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

/* Leave History Card */
.leave-history-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Leave List */
.leave-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leave-item {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.leave-item:hover {
  border-color: #dadce0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.leave-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.type-badge {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
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

.leave-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 16px;
}

.detail-label {
  font-weight: 500;
  color: #5f6368;
  min-width: 80px;
}

.detail-value {
  color: #2c3e50;
  flex: 1;
}

.leave-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f1f3f4;
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
  .employee-leaves {
    padding: 16px;
  }
  
  .leave-form-card,
  .leave-history-card {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
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
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
