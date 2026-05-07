<template>
  <div class="manager-leave-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Leave Management</h1>
      <p class="page-subtitle">Review and manage team leave requests</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading leave requests...</p>
    </div>
    
    <!-- Leave Management Content -->
    <div v-else class="leave-content">
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <p class="stat-number">{{ pendingLeaves.length }}</p>
            <p class="stat-label">Pending Review</p>
          </div>
        </div>
        <div class="stat-card approved">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <p class="stat-number">{{ approvedCount }}</p>
            <p class="stat-label">Approved</p>
          </div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <p class="stat-number">{{ rejectedCount }}</p>
            <p class="stat-label">Rejected</p>
          </div>
        </div>
        <div class="stat-card active">
          <div class="stat-icon">🏖️</div>
          <div class="stat-content">
            <p class="stat-number">{{ onLeaveCount }}</p>
            <p class="stat-label">Currently on Leave</p>
          </div>
        </div>
      </div>
      
      <!-- Leave Requests Table -->
      <div class="leave-requests-card">
        <div class="card-header">
          <h3 class="card-title">Leave Requests</h3>
          
          <!-- Filters -->
          <div class="filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select v-model="monthFilter" class="filter-select">
              <option value="">All Months</option>
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Table -->
        <div v-if="filteredLeaves.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No leave requests found</p>
        </div>
        
        <div v-else class="table-container">
          <table class="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="leave in filteredLeaves" 
                :key="leave.id"
                class="leave-row"
                :class="leave.status"
              >
                <td>
                  <div class="employee-info">
                    <div class="employee-avatar">
                      {{ getInitials(leave.employee?.user?.name) }}
                    </div>
                    <div>
                      <div class="employee-name">{{ leave.employee?.user?.name }}</div>
                      <div class="employee-id">{{ leave.employee?.employee_number }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="leave-type-badge">{{ leave.leave_type?.name }}</span>
                </td>
                <td>
                  <div class="duration-info">
                    <div>{{ formatDate(leave.start_date) }}</div>
                    <div class="duration-arrow">→</div>
                    <div>{{ formatDate(leave.end_date) }}</div>
                    <div class="duration-days">{{ leave.duration }} days</div>
                  </div>
                </td>
                <td>
                  <div class="reason-text">{{ leave.description || 'No reason provided' }}</div>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(leave.status)">
                    {{ leave.status }}
                  </span>
                </td>
                <td>{{ formatDate(leave.created_at) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      v-if="leave.status === 'pending'"
                      @click="openApproveModal(leave)"
                      class="btn btn-success btn-sm"
                    >
                      Approve
                    </button>
                    
                    <button 
                      v-if="leave.status === 'pending'"
                      @click="openRejectModal(leave)"
                      class="btn btn-danger btn-sm"
                    >
                      Reject
                    </button>
                    
                    <button 
                      @click="viewLeaveDetails(leave)"
                      class="btn btn-secondary btn-sm"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Leave Details Modal -->
      <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Leave Request Details</h3>
            <button @click="closeDetailsModal" class="modal-close">×</button>
          </div>
          
          <div class="modal-body">
            <div v-if="selectedLeave" class="leave-details">
              <!-- Employee Information -->
              <div class="detail-section">
                <h4>Employee Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Name:</span>
                    <span class="value">{{ selectedLeave.employee?.user?.name }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Employee ID:</span>
                    <span class="value">{{ selectedLeave.employee?.employee_number }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Department:</span>
                    <span class="value">{{ selectedLeave.employee?.department?.name || 'Not assigned' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Leave Information -->
              <div class="detail-section">
                <h4>Leave Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Leave Type:</span>
                    <span class="value">{{ selectedLeave.leave_type?.name }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Duration:</span>
                    <span class="value">{{ formatDate(selectedLeave.start_date) }} → {{ formatDate(selectedLeave.end_date) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Total Days:</span>
                    <span class="value">{{ selectedLeave.duration || 'N/A' }} days</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Status:</span>
                    <span class="status-badge" :class="getStatusClass(selectedLeave.status)">
                      {{ selectedLeave.status }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Applied On:</span>
                    <span class="value">{{ formatDate(selectedLeave.created_at) }}</span>
                  </div>
                  <div class="detail-item full-width">
                    <span class="label">Reason:</span>
                    <span class="value">{{ selectedLeave.description || 'No reason provided' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Approval Information (if applicable) -->
              <div v-if="selectedLeave.status !== 'pending'" class="detail-section">
                <h4>Approval Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Approved By:</span>
                    <span class="value">{{ selectedLeave.approved_by || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Approved At:</span>
                    <span class="value">{{ formatDate(selectedLeave.approved_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeDetailsModal" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
      
      <!-- Success/Error Messages -->
      <AppMessage
        v-if="message"
        :type="messageType"
        :text="message"
      />
    </div>
    
    <!-- Approve Modal -->
    <div v-if="showApproveModal" class="modal-overlay" @click="closeApproveModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Approve Leave Request</h3>
          <button @click="closeApproveModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="leave-summary">
            <div class="summary-header">
              <strong>{{ selectedLeave?.employee?.user?.name }}</strong>
              <span class="leave-type">{{ selectedLeave?.leave_type?.name }}</span>
            </div>
            <div class="summary-dates">
              {{ formatDate(selectedLeave?.start_date) }} → {{ formatDate(selectedLeave?.end_date) }}
              <span class="duration">({{ selectedLeave?.duration }} days)</span>
            </div>
            <div class="summary-reason">
              <strong>Reason:</strong> {{ selectedLeave?.description || 'No reason provided' }}
            </div>
          </div>
          
          <div class="form-group">
            <label>Comments (optional):</label>
            <textarea 
              v-model="approveComments" 
              class="form-textarea"
              rows="3"
              placeholder="Add any comments or notes..."
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeApproveModal" class="btn btn-secondary">Cancel</button>
          <button @click="approveLeave" class="btn btn-success">Approve Request</button>
        </div>
      </div>
    </div>
    
    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Reject Leave Request</h3>
          <button @click="closeRejectModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="leave-summary">
            <div class="summary-header">
              <strong>{{ selectedLeave?.employee?.user?.name }}</strong>
              <span class="leave-type">{{ selectedLeave?.leave_type?.name }}</span>
            </div>
            <div class="summary-dates">
              {{ formatDate(selectedLeave?.start_date) }} → {{ formatDate(selectedLeave?.end_date) }}
              <span class="duration">({{ selectedLeave?.duration }} days)</span>
            </div>
            <div class="summary-reason">
              <strong>Reason:</strong> {{ selectedLeave?.description || 'No reason provided' }}
            </div>
          </div>
          
          <div class="form-group">
            <label>Rejection Reason <span class="required">*</span>:</label>
            <textarea 
              v-model="rejectReason" 
              class="form-textarea"
              rows="3"
              placeholder="Please provide a reason for rejection..."
              required
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeRejectModal" class="btn btn-secondary">Cancel</button>
          <button @click="rejectLeave" class="btn btn-danger" :disabled="!rejectReason">
            Reject Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useManagerStore } from '@/stores/managerStore'
import AppMessage from '../../components/common/AppMessage.vue'

export default {
  name: 'ManagerLeaveManagement',
  components: {
    AppMessage
  },
  setup() {
    const managerStore = useManagerStore()
    
    // Local reactive data for modals and filters
    const statusFilter = ref('')
    const monthFilter = ref('')
    
    // Modal states
    const showApproveModal = ref(false)
    const showRejectModal = ref(false)
    const showDetailsModal = ref(false)
    const selectedLeave = ref(null)
    const approveComments = ref('')
    const rejectReason = ref('')
    
    // Computed properties
    const months = computed(() => [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ])
    
    const pendingLeaves = computed(() => {
      if (!Array.isArray(managerStore.departmentLeaves)) return []
      return managerStore.departmentLeaves.filter(leave => leave.status === 'pending')
    })
    
    const approvedCount = computed(() => {
      return managerStore.approvedCount
    })
    
    const rejectedCount = computed(() => {
      return managerStore.rejectedCount
    })
    
    const onLeaveCount = computed(() => {
      const now = new Date()
      return managerStore.departmentLeaves.filter(leave => 
        leave.status === 'approved' &&
        new Date(leave.start_date) <= now &&
        new Date(leave.end_date) >= now
      ).length
    })
    
    const filteredLeaves = computed(() => {
      let filtered = managerStore.departmentLeaves
      
      if (statusFilter.value) {
        filtered = filtered.filter(leave => leave.status === statusFilter.value)
      }
      
      if (monthFilter.value) {
        filtered = filtered.filter(leave => {
          const leaveMonth = new Date(leave.start_date).getMonth() + 1
          return leaveMonth === parseInt(monthFilter.value)
        })
      }
      
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })
    
    // Methods
    const loadLeaves = async () => {
      try {
        await managerStore.loadDepartmentLeaves()
      } catch (error) {
        console.error('Error loading leaves:', error)
        managerStore.showMessage('Error loading leave requests', 'error')
      }
    }
    
    const openApproveModal = (leave) => {
      selectedLeave.value = leave
      approveComments.value = ''
      showApproveModal.value = true
    }
    
    const closeApproveModal = () => {
      showApproveModal.value = false
      selectedLeave.value = null
      approveComments.value = ''
    }
    
    const openRejectModal = (leave) => {
      selectedLeave.value = leave
      rejectReason.value = ''
      showRejectModal.value = true
    }
    
    const closeRejectModal = () => {
      showRejectModal.value = false
      selectedLeave.value = null
      rejectReason.value = ''
    }
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedLeave.value = null
    }
    
    const approveLeave = async () => {
      try {
        await managerStore.updateLeaveStatus(selectedLeave.value.id, 'approved', approveComments.value)
        
        managerStore.showMessage('Leave request approved successfully!', 'success')
        closeApproveModal()
        
      } catch (error) {
        console.error('Error approving leave:', error)
        managerStore.showMessage('Error approving leave request', 'error')
      }
    }
    
    const rejectLeave = async () => {
      try {
        await managerStore.updateLeaveStatus(selectedLeave.value.id, 'rejected', rejectReason.value)
        
        managerStore.showMessage('Leave request rejected', 'success')
        closeRejectModal()
        
      } catch (error) {
        console.error('Error rejecting leave:', error)
        managerStore.showMessage('Error rejecting leave request', 'error')
      }
    }
    
    const viewLeaveDetails = (leave) => {
      // Calculate duration in frontend if not provided
      if (!leave.duration && leave.start_date && leave.end_date) {
        const start = new Date(leave.start_date)
        const end = new Date(leave.end_date)
        leave.duration = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
      }
      
      selectedLeave.value = leave
      showDetailsModal.value = true
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
      return managerStore.formatDate(dateString)
    }
    
    const getStatusClass = (status) => {
      return managerStore.getLeaveStatusColor(status)
    }
    
    // Lifecycle
    onMounted(() => {
      loadLeaves()
    })
    
    return {
      // Store state as computed properties for reactivity
      loading: computed(() => managerStore.loading.leaves),
      message: computed(() => managerStore.message),
      messageType: computed(() => managerStore.messageType),
      leaves: computed(() => managerStore.departmentLeaves),
      
      // Local state
      statusFilter,
      monthFilter,
      showApproveModal,
      showRejectModal,
      showDetailsModal,
      selectedLeave,
      approveComments,
      rejectReason,
      
      // Computed properties
      months,
      pendingLeaves,
      approvedCount,
      rejectedCount,
      onLeaveCount,
      filteredLeaves,
      
      // Methods
      loadLeaves,
      openApproveModal,
      closeApproveModal,
      openRejectModal,
      closeRejectModal,
      closeDetailsModal,
      approveLeave,
      rejectLeave,
      viewLeaveDetails,
      getInitials,
      formatDate,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.manager-leave-management {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.pending {
  border-left: 4px solid #f59e0b;
}

.stat-card.approved {
  border-left: 4px solid #10b981;
}

.stat-card.rejected {
  border-left: 4px solid #ef4444;
}

.stat-card.active {
  border-left: 4px solid #3b82f6;
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
  font-size: 14px;
  color: #5f6368;
  margin: 0;
}

/* Leave Requests Card */
.leave-requests-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.filters {
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

/* Table */
.table-container {
  overflow-x: auto;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
}

.leave-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e8eaed;
}

.leave-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f3f4;
}

.leave-row:hover {
  background: #f8f9fa;
}

.leave-row.pending {
  background: #fef3c7;
}

.leave-row.approved {
  background: #d1fae5;
}

.leave-row.rejected {
  background: #fee2e2;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3d7d73;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.employee-name {
  font-weight: 600;
  color: #2c3e50;
}

.employee-id {
  font-size: 12px;
  color: #5f6368;
}

.leave-type-badge {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.duration-arrow {
  color: #9ca3af;
}

.duration-days {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.reason-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #5f6368;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-secondary {
  background: white;
  color: #5f6368;
  border: 1px solid #e8eaed;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #5f6368;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 24px;
}

.leave-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.leave-type {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.summary-dates {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.duration {
  color: #5f6368;
  font-size: 12px;
}

.summary-reason {
  font-size: 14px;
  color: #5f6368;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e8eaed;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #1a73e8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e8eaed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .manager-leave-management {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .leave-requests-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters {
    width: 100%;
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .table-container {
    font-size: 12px;
  }
  
  .leave-table th,
  .leave-table td {
    padding: 8px 4px;
  }
  
  .duration-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
