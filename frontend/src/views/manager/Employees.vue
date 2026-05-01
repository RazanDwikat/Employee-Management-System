<template>
  <div class="manager-employees">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">My Team</h1>
      <p class="page-subtitle">Manage your department employees</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading team members...</p>
    </div>
    
    <!-- Employees Content -->
    <div v-else class="employees-content">
      <!-- Team Statistics -->
      <div class="stats-card">
        <h3 class="stats-title">Team Overview</h3>
        <div class="stats-grid">
          <div class="stat-item total">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <p class="stat-number">{{ employees.length }}</p>
              <p class="stat-label">Total Members</p>
            </div>
          </div>
          <div class="stat-item present">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <p class="stat-number">{{ presentCount }}</p>
              <p class="stat-label">Present Today</p>
            </div>
          </div>
          <div class="stat-item on-leave">
            <div class="stat-icon">🏖️</div>
            <div class="stat-content">
              <p class="stat-number">{{ onLeaveCount }}</p>
              <p class="stat-label">On Leave</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Employee List -->
      <div class="employees-card">
        <div class="card-header">
          <h3 class="card-title">Team Members</h3>
          
          <div class="header-actions">
            <!-- Search -->
            <div class="search-box">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search employees..."
                class="search-input"
              />
            </div>
            
            <!-- Add Employee Button -->
            <button 
              @click="openAssignmentModal"
              class="btn btn-success"
            >
              + Add Employee to Department
            </button>
          </div>
        </div>
        
        <!-- Employees Grid -->
        <div v-if="filteredEmployees.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <p>{{ searchQuery ? 'No employees found' : 'No team members assigned yet' }}</p>
        </div>
        
        <div v-else class="employees-grid">
          <div 
            v-for="employee in filteredEmployees" 
            :key="employee.id"
            class="employee-card"
          >
            <div class="employee-header">
              <div class="employee-avatar">
                {{ getInitials(employee.user?.name) }}
              </div>
              <div class="employee-info">
                <h4 class="employee-name">{{ employee.user?.name }}</h4>
                <p class="employee-email">{{ employee.user?.email }}</p>
                <p class="employee-id">{{ employee.employee_number }}</p>
              </div>
              <div class="employee-status">
                <span class="status-badge" :class="getStatusClass(employee.status)">
                  {{ employee.status || 'Active' }}
                </span>
              </div>
            </div>
            
            <div class="employee-details">
              <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">{{ employee.department?.name || 'Not assigned' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hire Date:</span>
                <span class="detail-value">{{ formatDate(employee.hire_date) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Schedule:</span>
                <span class="detail-value">{{ employee.work_schedule?.name || 'Not set' }}</span>
              </div>
            </div>
            
            <!-- Employee Actions -->
            <div class="employee-actions">
              <button 
                @click="viewEmployeeDetails(employee)"
                class="btn btn-primary btn-sm"
              >
                View Details
              </button>
              
              <button 
                @click="showScheduleModal(employee)"
                class="btn btn-secondary btn-sm"
              >
                Update Schedule
              </button>
              
              <button 
                @click="removeEmployee(employee)"
                class="btn btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
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
    
    <!-- Employee Assignment Modal -->
    <div v-if="showAssignmentModal" class="modal-overlay" @click="closeAssignmentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Employee to Department</h3>
          <button @click="closeAssignmentModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingAssignment" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading available employees...</p>
          </div>
          
          <div v-else-if="availableEmployees.length === 0" class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No employees available for assignment</h3>
            <p>All active employees are already in your department</p>
          </div>
          
          <div v-else class="employees-list">
            <div class="list-header">
              <h4>Available Employees</h4>
              <span class="count">{{ availableEmployees.length }} employees</span>
            </div>
            
            <div class="employee-list">
              <div 
                v-for="employee in availableEmployees" 
                :key="employee.id"
                class="employee-item"
                @click="assignEmployee(employee)"
              >
                <div class="employee-info">
                  <div class="employee-avatar">
                    {{ getInitials(employee.user?.name) }}
                  </div>
                  <div class="employee-details">
                    <div class="employee-name">{{ employee.user?.name }}</div>
                    <div class="employee-id">{{ employee.employee_number }}</div>
                    <div class="employee-department">{{ employee.department?.name || 'No department' }}</div>
                  </div>
                </div>
                <div class="assign-action">
                  <button class="btn btn-success btn-sm">
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAssignmentModal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
    
    <!-- Employee Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Employee Details</h3>
          <button @click="closeDetailsModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedEmployee" class="employee-details">
            <!-- Employee Basic Info -->
            <div class="detail-section">
              <h4>Basic Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Name:</span>
                  <span class="value">{{ selectedEmployee.user?.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ selectedEmployee.user?.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Employee ID:</span>
                  <span class="value">{{ selectedEmployee.employee_number }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Phone:</span>
                  <span class="value">{{ selectedEmployee.phone || 'Not provided' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Address:</span>
                  <span class="value">{{ selectedEmployee.address || 'Not provided' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span class="status-badge" :class="getStatusClass(selectedEmployee.employment_status)">
                    {{ selectedEmployee.employment_status || 'Active' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Work Information -->
            <div class="detail-section">
              <h4>Work Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Department:</span>
                  <span class="value">{{ selectedEmployee.department?.name || 'Not assigned' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Work Schedule:</span>
                  <span class="value">{{ selectedEmployee.work_schedule?.name || 'Not set' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Hire Date:</span>
                  <span class="value">{{ formatDate(selectedEmployee.hire_date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showScheduleModal(selectedEmployee)" class="btn btn-primary">
            Update Schedule
          </button>
          <button @click="closeDetailsModal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
    
    <!-- Schedule Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Update Work Schedule</h3>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="employee-summary">
            <strong>{{ selectedEmployee?.user?.name }}</strong>
            <p>{{ selectedEmployee?.employee_number }}</p>
          </div>
          
          <div class="form-group">
            <label>Select Work Schedule:</label>
            <select v-model="selectedSchedule" class="form-select">
              <option value="">Choose a schedule...</option>
              <option 
                v-for="schedule in availableSchedules" 
                :key="schedule.id"
                :value="schedule.id"
              >
                {{ schedule.name }} ({{ schedule.start_time }} - {{ schedule.end_time }})
              </option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button @click="updateSchedule" class="btn btn-primary" :disabled="!selectedSchedule">
            Update Schedule
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import managerService from '../../services/managerService'
import AppMessage from '../../components/common/AppMessage.vue'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'ManagerEmployees',
  components: {
    AppMessage
  },
  setup() {
    // Reactive data
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('success')
    const employees = ref([])
    const searchQuery = ref('')
    const showModal = ref(false)
    const showDetailsModal = ref(false)
    const showAssignmentModal = ref(false)
    const selectedEmployee = ref(null)
    const selectedSchedule = ref(null)
    const availableSchedules = ref([])
    const availableEmployees = ref([])
    const loadingAssignment = ref(false)
    
    // Computed properties
    const filteredEmployees = computed(() => {
      if (!searchQuery.value) return employees.value
      
      const query = searchQuery.value.toLowerCase()
      return employees.value.filter(employee => 
        employee.user?.name?.toLowerCase().includes(query) ||
        employee.user?.email?.toLowerCase().includes(query) ||
        employee.employee_number?.toLowerCase().includes(query)
      )
    })
    
    const presentCount = computed(() => {
      return employees.value.filter(emp => 
        emp.attendances?.some(att => 
          att.date === new Date().toISOString().split('T')[0] && 
          att.status === 'present'
        )
      ).length
    })
    
    const onLeaveCount = computed(() => {
      return employees.value.filter(emp => 
        emp.leaves?.some(leave => 
          leave.status === 'approved' &&
          new Date(leave.start_date) <= new Date() &&
          new Date(leave.end_date) >= new Date()
        )
      ).length
    })
    
    // Methods
    const loadEmployees = async () => {
      try {
        loading.value = true
        
        const response = await managerService.getEmployees()
        employees.value = response.employees || []
        
      } catch (error) {
        console.error('Error loading employees:', error)
        showMessage('Error loading team members', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const loadSchedules = async () => {
      try {
        const response = await managerService.getWorkSchedules()
        
        // Handle different response structures
        if (response.data) {
          availableSchedules.value = response.data
        } else if (response.schedules) {
          availableSchedules.value = response.schedules
        } else {
          availableSchedules.value = response || []
        }
      } catch (error) {
        console.error('Error loading schedules:', error)
      }
    }
    
    const viewEmployeeDetails = (employee) => {
      selectedEmployee.value = employee
      showDetailsModal.value = true
    }
    
    const showScheduleModal = (employee) => {
      selectedEmployee.value = employee
      selectedSchedule.value = employee.work_schedule_id || ''
      showModal.value = true
    }
    
    const closeModal = () => {
      showModal.value = false
      selectedEmployee.value = null
      selectedSchedule.value = ''
    }
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedEmployee.value = null
    }
    
    const updateSchedule = async () => {
      try {
        const response = await managerService.updateEmployeeSchedule(selectedEmployee.value.id, selectedSchedule.value)
        
        // Update local data with backend response
        const employeeIndex = employees.value.findIndex(emp => emp.id === selectedEmployee.value.id)
        if (employeeIndex !== -1) {
          employees.value[employeeIndex] = response.employee
        }
        
        showMessage('Work schedule updated successfully!', 'success')
        closeModal()
        
      } catch (error) {
        console.error('Error updating schedule:', error)
        showMessage('Error updating work schedule', 'error')
      }
    }
    
    const removeEmployee = async (employee) => {
      if (!confirm(`Are you sure you want to remove ${employee.user?.name} from your department?`)) {
        return
      }
      
      try {
        await managerService.removeEmployee(employee.id)
        
        // Remove from local data
        employees.value = employees.value.filter(emp => emp.id !== employee.id)
        
        showMessage('Employee removed from department', 'success')
        
      } catch (error) {
        console.error('Error removing employee:', error)
        showMessage('Error removing employee', 'error')
      }
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
      const classes = {
        active: 'text-green-600 bg-green-100',
        inactive: 'text-red-600 bg-red-100',
        on_leave: 'text-yellow-600 bg-yellow-100'
      }
      return classes[status] || 'text-green-600 bg-green-100'
    }
    
    // Helper function to check if employee is in manager's department
    const isInManagerDepartment = (employee) => {
      const authStore = useAuthStore()
      const managerDepartmentId = authStore.user?.employee?.department_id
      return employee.department_id === managerDepartmentId
    }
    
    // Assignment modal methods
    const openAssignmentModal = async () => {
      try {
        loadingAssignment.value = true
        showAssignmentModal.value = true
        
        const response = await managerService.getEmployeesForAssignment()
        availableEmployees.value = response.employees || []
        
        // Convert to array if it's not already
        if (!Array.isArray(availableEmployees.value)) {
          availableEmployees.value = Object.values(availableEmployees.value)
        }
        
      } catch (error) {
        console.error('Error loading employees for assignment:', error)
        showMessage('Error loading available employees', 'error')
      } finally {
        loadingAssignment.value = false
      }
    }
    
    const closeAssignmentModal = () => {
      showAssignmentModal.value = false
      availableEmployees.value = []
    }
    
    // Assign employee from modal
    const assignEmployee = async (employee) => {
      try {
        const authStore = useAuthStore()
        const response = await managerService.assignEmployee(employee.id)
        
        // Add employee to current employees list
        employees.value.push({
          ...employee,
          department_id: authStore.user.employee.department_id,
          department: {
            name: authStore.user.employee.department?.name || 'Department'
          }
        })
        
        // Remove from available employees
        const index = availableEmployees.value.findIndex(emp => emp.id === employee.id)
        if (index !== -1) {
          availableEmployees.value.splice(index, 1)
        }
        
        showMessage(`${employee.user?.name} assigned to your department successfully!`, 'success')
        
        // Close modal if no more employees available
        if (availableEmployees.value.length === 0) {
          closeAssignmentModal()
        }
        
      } catch (error) {
        console.error('Error assigning employee:', error)
        showMessage(error.response?.data?.message || 'Error assigning employee', 'error')
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadEmployees()
      loadSchedules()
    })
    
    return {
      loading,
      message,
      messageType,
      employees,
      searchQuery,
      showModal,
      showDetailsModal,
      showAssignmentModal,
      selectedEmployee,
      selectedSchedule,
      availableSchedules,
      availableEmployees,
      loadingAssignment,
      filteredEmployees,
      presentCount,
      onLeaveCount,
      loadEmployees,
      viewEmployeeDetails,
      showScheduleModal,
      closeModal,
      closeDetailsModal,
      updateSchedule,
      removeEmployee,
      openAssignmentModal,
      closeAssignmentModal,
      assignEmployee,
      isInManagerDepartment,
      getInitials,
      formatDate,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.manager-employees {
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

/* Stats Card */
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.stats-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
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

.stat-item.total {
  background: #e8f0fe;
}

.stat-item.present {
  background: #d1fae5;
}

.stat-item.on-leave {
  background: #fef3c7;
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

/* Employees Card */
.employees-card {
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

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e8eaed;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #1a73e8;
}

/* Employees Grid */
.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.employee-card {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.employee-card:hover {
  border-color: #dadce0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.employee-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3d7d73;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.employee-info {
  flex: 1;
}

.employee-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.employee-email {
  font-size: 12px;
  color: #5f6368;
  margin: 0 0 2px 0;
}

.employee-id {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
}

.employee-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.employee-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.detail-label {
  font-size: 12px;
  color: #5f6368;
}

.detail-value {
  font-size: 12px;
  color: #2c3e50;
  font-weight: 500;
}

.employee-actions {
  display: flex;
  gap: 8px;
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

.btn-primary {
  background: #1a73e8;
  color: white;
}

.btn-primary:hover {
  background: #1557b0;
}

.btn-secondary {
  background: white;
  color: #5f6368;
  border: 1px solid #e8eaed;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
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
  max-width: 500px;
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

.employee-summary {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
}

.employee-summary p {
  font-size: 12px;
  color: #5f6368;
  margin: 4px 0 0 0;
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

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e8eaed;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.form-select:focus {
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
  .manager-employees {
    padding: 16px;
  }
  
  .stats-card,
  .employees-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .employees-grid {
    grid-template-columns: 1fr;
  }
  
  .employee-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
