<template>
  <div class="leave-requests-management">
    <h1>Leave Requests Management</h1>
    
    <div class="actions-bar">
      <div class="search-section">
        <SearchFilter 
          v-model:searchQuery="searchQuery"
          :filters="filterConfig"
          :loading="loading"
          search-placeholder="Search by employee name..."
          @filter-change="handleFilterChange"
          @clear-filters="clearFilters"
        />
      </div>
      
      <div class="stats-section">
        <div class="stat-card pending">
          <span class="stat-number">{{ pendingCount }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-card approved">
          <span class="stat-number">{{ approvedCount }}</span>
          <span class="stat-label">Approved</span>
        </div>
        <div class="stat-card rejected">
          <span class="stat-number">{{ rejectedCount }}</span>
          <span class="stat-label">Rejected</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="leaveRequests" 
      :columns="leaveRequestColumns" 
      :loading="loading"
      :empty-message="'No leave requests found'"
    >
      <template #cell-employee="{ item }">
        <div class="employee-info">
          <div class="employee-name">{{ item.employee?.user?.name || 'N/A' }}</div>
          <div class="employee-department">{{ item.employee?.department?.name || 'N/A' }}</div>
        </div>
      </template>
      
      <template #cell-leave_type="{ item }">
        <div class="leave-type-info">
          <div class="type-name">{{ item.leave_type?.name || 'N/A' }}</div>
          <div class="type-days">{{ item.leave_type?.max_days || 'N/A' }} days</div>
        </div>
      </template>
      
      <template #cell-dates="{ item }">
        <div class="date-info">
          <div class="date-range">
            {{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}
          </div>
          <div class="duration">{{ calculateDuration(item.start_date, item.end_date) }} days</div>
        </div>
      </template>
      
      <template #cell-status="{ item }">
        <span :class="getStatusClass(item.status)">
          {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
        </span>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button 
            v-if="item.status === 'pending'"
            @click="approveRequest(item)" 
            class="approve-btn" 
            :disabled="loading"
          >
            Approve
          </button>
          <button 
            v-if="item.status === 'pending'"
            @click="openRejectModal(item)" 
            class="reject-btn" 
            :disabled="loading"
          >
            Reject
          </button>
          <button 
            @click="viewDetails(item)" 
            class="view-btn" 
            :disabled="loading"
          >
            View
          </button>
        </div>
      </template>
    </DataTable>
    
    <!-- Reject Modal -->
    <BaseModal 
      v-model="showRejectModal"
      title="Reject Leave Request"
      :loading="loading"
      loading-text="Rejecting..."
      save-text="Reject"
      @save="confirmReject"
      @cancel="closeRejectModal"
    >
      <template #body>
        <div class="reject-form">
          <div class="request-info">
            <h4>Request Details</h4>
            <p><strong>Employee:</strong> {{ selectedRequest?.employee?.user?.name }}</p>
            <p><strong>Leave Type:</strong> {{ selectedRequest?.leave_type?.name }}</p>
            <p><strong>Dates:</strong> {{ formatDate(selectedRequest?.start_date) }} - {{ formatDate(selectedRequest?.end_date) }}</p>
            <p><strong>Reason:</strong> {{ selectedRequest?.description || 'No reason provided' }}</p>
          </div>
          
          <div class="form-group">
            <label for="rejectReason">Rejection Reason</label>
            <textarea 
              id="rejectReason" 
              v-model="rejectReason" 
              placeholder="Please provide a reason for rejection"
              rows="4"
              required
              :disabled="loading"
            ></textarea>
          </div>
        </div>
      </template>
    </BaseModal>
    
    <!-- Details Modal -->
    <BaseModal 
      v-model="showDetailsModal"
      :title="'Leave Request Details'"
      :loading="false"
      save-text=""
      @cancel="closeDetailsModal"
    >
      <template #body>
        <div class="request-details" v-if="selectedRequest">
          <div class="detail-section">
            <h4>Employee Information</h4>
            <p><strong>Name:</strong> {{ selectedRequest.employee?.user?.name }}</p>
            <p><strong>Department:</strong> {{ selectedRequest.employee?.department?.name }}</p>
            <p><strong>Email:</strong> {{ selectedRequest.employee?.user?.email }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Leave Details</h4>
            <p><strong>Type:</strong> {{ selectedRequest.leave_type?.name }}</p>
            <p><strong>Dates:</strong> {{ formatDate(selectedRequest.start_date) }} - {{ formatDate(selectedRequest.end_date) }}</p>
            <p><strong>Duration:</strong> {{ calculateDuration(selectedRequest.start_date, selectedRequest.end_date) }} days</p>
            <p><strong>Status:</strong> <span :class="getStatusClass(selectedRequest.status)">{{ selectedRequest.status }}</span></p>
          </div>
          
          <div class="detail-section">
            <h4>Reason</h4>
            <p>{{ selectedRequest.description || 'No reason provided' }}</p>
          </div>
          
          <div class="detail-section" v-if="selectedRequest.approved_by">
            <h4>Approval Information</h4>
            <p><strong>Approved by:</strong> {{ selectedRequest.approver?.name }}</p>
            <p><strong>Approved at:</strong> {{ formatDate(selectedRequest.approved_at) }}</p>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import DataTable from '../../components/common/DataTable.vue'
import BaseModal from '../../components/common/BaseModal.vue'
import SearchFilter from '../../components/common/SearchFilter.vue'
import leaveService from '../../services/leaveService.js'

export default {
  name: 'LeaveRequestsManagement',
  components: {
    DataTable,
    BaseModal,
    SearchFilter
  },
  setup() {
    const leaveRequests = ref([])
    const allLeaveRequests = ref([])
    const loading = ref(false)
    const error = ref('')
    const showRejectModal = ref(false)
    const showDetailsModal = ref(false)
    const selectedRequest = ref(null)
    const rejectReason = ref('')
    
    // Search and filters
    const searchQuery = ref('')
    const filters = ref({
      status: '',
      leave_type_id: ''
    })
    
    // Columns definition
    const leaveRequestColumns = [
      { key: 'employee', label: 'Employee' },
      { key: 'leave_type', label: 'Leave Type' },
      { key: 'dates', label: 'Dates' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' }
    ]
    
    // Filter configuration
    const filterConfig = [
      {
        key: 'status',
        placeholder: 'All Status',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' }
        ]
      }
    ]
    
    // Computed properties for statistics
    const pendingCount = computed(() => {
      if (!Array.isArray(allLeaveRequests.value)) return 0
      return allLeaveRequests.value.filter(req => req.status === 'pending').length
    })
    
    const approvedCount = computed(() => {
      if (!Array.isArray(allLeaveRequests.value)) return 0
      return allLeaveRequests.value.filter(req => req.status === 'approved').length
    })
    
    const rejectedCount = computed(() => {
      if (!Array.isArray(allLeaveRequests.value)) return 0
      return allLeaveRequests.value.filter(req => req.status === 'rejected').length
    })
    
    // Fetch leave requests
    const fetchLeaveRequests = async () => {
      loading.value = true
      error.value = ''
      
      try {
        console.log('Fetching leave requests...')
        const response = await leaveService.getLeaveRequests({ per_page: 100 })
        console.log('Leave requests fetched:', response)
        
        const data = response.data || response
        
        // Ensure data is an array
        allLeaveRequests.value = Array.isArray(data) ? data : []
        
        console.log('Processed data:', allLeaveRequests.value)
        
        // Apply frontend filtering
        applyFrontendFilters()
        
        console.log('Leave requests assigned:', allLeaveRequests.value)
      } catch (err) {
        console.error('Error fetching leave requests:', err)
        error.value = err.response?.data?.message || 'Failed to fetch leave requests. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    // Apply frontend filtering
    const applyFrontendFilters = () => {
      if (!Array.isArray(allLeaveRequests.value)) {
        leaveRequests.value = []
        return
      }
      
      let filteredRequests = [...allLeaveRequests.value]
      
      // Apply search filter
      if (searchQuery.value.trim()) {
        filteredRequests = filteredRequests.filter(request => 
          request.employee?.user?.name?.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
          request.leave_type?.name?.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
          (request.description && request.description.toLowerCase().includes(searchQuery.value.toLowerCase().trim()))
        )
      }
      
      // Apply status filter
      if (filters.value.status) {
        filteredRequests = filteredRequests.filter(request => 
          request.status === filters.value.status
        )
      }
      
      leaveRequests.value = filteredRequests
    }
    
    const handleFilterChange = (filterData) => {
      searchQuery.value = filterData.search
      filters.value = filterData.filters
      applyFrontendFilters()
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = {
        status: '',
        leave_type_id: ''
      }
      applyFrontendFilters()
    }
    
    // Approve leave request
    const approveRequest = async (request) => {
      if (!confirm(`Are you sure you want to approve this leave request for ${request.employee?.user?.name}?`)) {
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        console.log(`Approving leave request ${request.id}`)
        await leaveService.updateLeaveStatus(request.id, 'approve')
        console.log('Leave request approved successfully')
        await fetchLeaveRequests()
      } catch (err) {
        console.error('Error approving leave request:', err)
        error.value = err.response?.data?.message || 'Failed to approve leave request. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    // Show reject modal
    const openRejectModal = (request) => {
      selectedRequest.value = request
      rejectReason.value = ''
      showRejectModal.value = true
    }
    
    // Confirm rejection
    const confirmReject = async () => {
      if (!rejectReason.value.trim()) {
        error.value = 'Please provide a reason for rejection.'
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        console.log(`Rejecting leave request ${selectedRequest.value.id}`)
        await leaveService.updateLeaveStatus(selectedRequest.value.id, 'reject', rejectReason.value)
        console.log('Leave request rejected successfully')
        await fetchLeaveRequests()
        closeRejectModal()
      } catch (err) {
        console.error('Error rejecting leave request:', err)
        error.value = err.response?.data?.message || 'Failed to reject leave request. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    // Close reject modal
    const closeRejectModal = () => {
      showRejectModal.value = false
      selectedRequest.value = null
      rejectReason.value = ''
    }
    
    // View request details
    const viewDetails = (request) => {
      selectedRequest.value = request
      showDetailsModal.value = true
    }
    
    // Close details modal
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedRequest.value = null
    }
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Calculate duration
    const calculateDuration = (startDate, endDate) => {
      if (!startDate || !endDate) return 0
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    
    // Get status CSS class
    const getStatusClass = (status) => {
      switch (status) {
        case 'pending':
          return 'status-badge pending'
        case 'approved':
          return 'status-badge approved'
        case 'rejected':
          return 'status-badge rejected'
        default:
          return 'status-badge'
      }
    }
    
    // Fetch data on component mount
    onMounted(() => {
      fetchLeaveRequests()
    })
    
    return {
      leaveRequests,
      allLeaveRequests,
      loading,
      error,
      showRejectModal,
      showDetailsModal,
      selectedRequest,
      rejectReason,
      searchQuery,
      filters,
      leaveRequestColumns,
      filterConfig,
      pendingCount,
      approvedCount,
      rejectedCount,
      fetchLeaveRequests,
      applyFrontendFilters,
      handleFilterChange,
      clearFilters,
      approveRequest,
      openRejectModal,
      confirmReject,
      closeRejectModal,
      viewDetails,
      closeDetailsModal,
      formatDate,
      calculateDuration,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.leave-requests-management {
  padding: 20px;
  background: transparent;
  min-height: 100vh;
}

h1 {
  margin-bottom: 20px;
  color: #6c757d;
  font-weight: 300;
  font-size: 2rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.stats-section {
  display: flex;
  gap: 15px;
  align-items: center;
}

.stat-card {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  min-width: 100px;
  border: 1px solid #f1f3f4;
}

.stat-card.pending {
  border-color: #ffc107;
  background: #fff3cd;
}

.stat-card.approved {
  border-color: #28a745;
  background: #d4edda;
}

.stat-card.rejected {
  border-color: #dc3545;
  background: #f8d7da;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #6c757d;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: #6c757d;
}

.employee-department {
  font-size: 12px;
  color: #999;
}

.leave-type-info {
  display: flex;
  flex-direction: column;
}

.type-name {
  font-weight: 600;
  color: #6c757d;
}

.type-days {
  font-size: 12px;
  color: #999;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date-range {
  font-weight: 600;
  color: #6c757d;
}

.duration {
  font-size: 12px;
  color: #999;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.approve-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.approve-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.reject-btn {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reject-btn:hover:not(:disabled) {
  background: #f5c6cb;
  transform: translateY(-1px);
}

.view-btn {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn:hover:not(:disabled) {
  background: #bee5eb;
  transform: translateY(-1px);
}

.reject-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.request-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.request-info h4 {
  margin-bottom: 10px;
  color: #6c757d;
}

.request-info p {
  margin-bottom: 5px;
  color: #6c757d;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
}

.form-group textarea {
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
  box-sizing: border-box;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.form-group textarea:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #6c757d;
}

.detail-section p {
  margin-bottom: 5px;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    min-width: 100%;
  }
  
  .stats-section {
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
