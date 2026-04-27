<template>
  <div class="work-schedule-management">
    <h1>Work Schedule Management</h1>
    
    <div class="actions-bar">
      <div class="search-section">
        <SearchFilter 
          v-model:searchQuery="searchQuery"
          :filters="filterConfig"
          :loading="loading"
          search-placeholder="Search work schedules..."
          @filter-change="handleFilterChange"
          @clear-filters="clearFilters"
        />
      </div>
      
      <button @click="showAddModal = true" class="add-btn" :disabled="loading">
        Add New Schedule
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="workSchedules" 
      :columns="scheduleColumns" 
      :loading="loading"
      :empty-message="'No work schedules found'"
    >
      <template #cell-start_time="{ item }">
        <div class="time-info">
          <div class="time-value">{{ formatTime(item.start_time) }}</div>
          <div class="time-label">Start</div>
        </div>
      </template>
      
      <template #cell-end_time="{ item }">
        <div class="time-info">
          <div class="time-value">{{ formatTime(item.end_time) }}</div>
          <div class="time-label">End</div>
        </div>
      </template>
      
      <template #cell-late_grace_minutes="{ item }">
        <div class="grace-info">
          <span class="grace-value">{{ item.late_grace_minutes || 0 }}</span>
          <span class="grace-label">minutes</span>
        </div>
      </template>
      
      <template #cell-employees_count="{ item }">
        <div class="employees-info">
          <span class="employees-count">{{ item.employees_count || 0 }}</span>
          <span class="employees-label">employees</span>
        </div>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button @click="editSchedule(item)" class="edit-btn" :disabled="loading">
            Edit
          </button>
          <button @click="viewSchedule(item)" class="view-btn" :disabled="loading">
            View
          </button>
          <button @click="deleteSchedule(item)" class="delete-btn" :disabled="loading">
            Delete
          </button>
        </div>
      </template>
    </DataTable>
    
    <!-- Add/Edit Modal -->
    <BaseModal 
      v-model="showAddModal"
      :title="editingSchedule ? 'Edit Work Schedule' : 'Add New Work Schedule'"
      :loading="loading"
      loading-text="Saving..."
      save-text="Save"
      @save="saveSchedule"
      @cancel="closeModal"
    >
      <template #body>
        <form class="schedule-form" @submit.prevent>
          <div class="form-group">
            <label for="name">Schedule Name</label>
            <input 
              id="name" 
              v-model="scheduleForm.name" 
              type="text" 
              placeholder="e.g., Morning Shift, Evening Shift"
              maxlength="100"
              required
              :disabled="loading"
            />
            <div v-if="validationErrors.name" class="error-text">
              {{ validationErrors.name[0] }}
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="start_time">Start Time</label>
              <input 
                id="start_time" 
                v-model="scheduleForm.start_time" 
                type="time" 
                required
                :disabled="loading"
              />
              <div v-if="validationErrors.start_time" class="error-text">
                {{ validationErrors.start_time[0] }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="end_time">End Time</label>
              <input 
                id="end_time" 
                v-model="scheduleForm.end_time" 
                type="time" 
                required
                :disabled="loading"
              />
              <div v-if="validationErrors.end_time" class="error-text">
                {{ validationErrors.end_time[0] }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="late_grace_minutes">Late Grace Minutes (Optional)</label>
            <input 
              id="late_grace_minutes" 
              v-model.number="scheduleForm.late_grace_minutes" 
              type="number" 
              min="0"
              placeholder="e.g., 15"
              :disabled="loading"
            />
            <div v-if="validationErrors.late_grace_minutes" class="error-text">
              {{ validationErrors.late_grace_minutes[0] }}
            </div>
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- View Details Modal -->
    <BaseModal 
      v-model="showDetailsModal"
      :title="'Work Schedule Details'"
      :loading="false"
      save-text=""
      @cancel="closeDetailsModal"
    >
      <template #body>
        <div class="schedule-details" v-if="selectedSchedule">
          <div class="detail-section">
            <h4>Schedule Information</h4>
            <p><strong>Name:</strong> {{ selectedSchedule.name }}</p>
            <p><strong>Start Time:</strong> {{ formatTime(selectedSchedule.start_time) }}</p>
            <p><strong>End Time:</strong> {{ formatTime(selectedSchedule.end_time) }}</p>
            <p><strong>Late Grace Minutes:</strong> {{ selectedSchedule.late_grace_minutes || 0 }} minutes</p>
          </div>
          
          <div class="detail-section">
            <h4>Working Hours</h4>
            <p><strong>Total Hours:</strong> {{ calculateWorkingHours(selectedSchedule.start_time, selectedSchedule.end_time) }} hours</p>
            <p><strong>Duration:</strong> {{ formatTime(selectedSchedule.start_time) }} - {{ formatTime(selectedSchedule.end_time) }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Assigned Employees</h4>
            <div v-if="selectedSchedule.employees && selectedSchedule.employees.length > 0">
              <div 
                v-for="employee in selectedSchedule.employees" 
                :key="employee.id"
                class="employee-item"
              >
                {{ employee.user?.name || 'N/A' }} - {{ employee.department?.name || 'N/A' }}
              </div>
            </div>
            <p v-else>No employees assigned to this schedule.</p>
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
import workScheduleService from '../../services/workScheduleService.js'

export default {
  name: 'WorkScheduleManagement',
  components: {
    DataTable,
    BaseModal,
    SearchFilter
  },
  setup() {
    const workSchedules = ref([])
    const allWorkSchedules = ref([])
    const loading = ref(false)
    const error = ref('')
    const showAddModal = ref(false)
    const showDetailsModal = ref(false)
    const editingSchedule = ref(null)
    const selectedSchedule = ref(null)
    const validationErrors = ref({})
    
    // Search and filters
    const searchQuery = ref('')
    const filters = ref({
      has_employees: ''
    })
    
    // Form data
    const scheduleForm = ref({
      name: '',
      start_time: '',
      end_time: '',
      late_grace_minutes: ''
    })
    
    // Columns definition
    const scheduleColumns = [
      { key: 'name', label: 'Schedule Name' },
      { key: 'start_time', label: 'Start Time' },
      { key: 'end_time', label: 'End Time' },
      { key: 'late_grace_minutes', label: 'Grace Period' },
      { key: 'employees_count', label: 'Employees' },
      { key: 'actions', label: 'Actions' }
    ]
    
    // Filter configuration
    const filterConfig = [
      {
        key: 'has_employees',
        placeholder: 'All Schedules',
        options: [
          { value: 'has', label: 'Has Employees' },
          { value: 'none', label: 'No Employees' }
        ]
      }
    ]
    
    // Fetch work schedules
    const fetchWorkSchedules = async () => {
      loading.value = true
      error.value = ''
      
      try {
        console.log('Fetching work schedules...')
        const response = await workScheduleService.getWorkSchedules({ per_page: 50 })
        console.log('Work schedules fetched:', response)
        
        const data = response.data || response
        
        // Ensure data is an array
        allWorkSchedules.value = Array.isArray(data) ? data : []
        
        console.log('Processed data:', allWorkSchedules.value)
        
        // Apply frontend filtering
        applyFrontendFilters()
        
        console.log('Work schedules assigned:', allWorkSchedules.value)
      } catch (err) {
        console.error('Error fetching work schedules:', err)
        error.value = err.response?.data?.message || 'Failed to fetch work schedules. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    // Apply frontend filtering
    const applyFrontendFilters = () => {
      if (!Array.isArray(allWorkSchedules.value)) {
        workSchedules.value = []
        return
      }
      
      let filteredSchedules = [...allWorkSchedules.value]
      
      // Apply search filter
      if (searchQuery.value.trim()) {
        filteredSchedules = filteredSchedules.filter(schedule => 
          schedule.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
        )
      }
      
      // Apply employees filter
      if (filters.value.has_employees) {
        if (filters.value.has_employees === 'has') {
          filteredSchedules = filteredSchedules.filter(schedule => 
            schedule.employees_count > 0
          )
        } else if (filters.value.has_employees === 'none') {
          filteredSchedules = filteredSchedules.filter(schedule => 
            !schedule.employees_count || schedule.employees_count === 0
          )
        }
      }
      
      workSchedules.value = filteredSchedules
    }
    
    const handleFilterChange = (filterData) => {
      searchQuery.value = filterData.search
      filters.value = filterData.filters
      applyFrontendFilters()
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = {
        has_employees: ''
      }
      applyFrontendFilters()
    }
    
    // Save work schedule (create or update)
    const saveSchedule = async () => {
      loading.value = true
      error.value = ''
      validationErrors.value = {}
      
      try {
        // Prepare form data
        const formData = {
          name: scheduleForm.value.name.trim(),
          start_time: scheduleForm.value.start_time ? scheduleForm.value.start_time.substring(0, 5) : '',
          end_time: scheduleForm.value.end_time ? scheduleForm.value.end_time.substring(0, 5) : '',
          late_grace_minutes: scheduleForm.value.late_grace_minutes || null
        }
        
        console.log('Saving work schedule:', formData)
        console.log('Editing schedule ID:', editingSchedule.value?.id)
        console.log('Form values:', scheduleForm.value)
        
        if (editingSchedule.value) {
          // Update existing schedule
          console.log('Updating work schedule ID:', editingSchedule.value.id)
          const response = await workScheduleService.updateWorkSchedule(editingSchedule.value.id, formData)
          console.log('Work schedule updated successfully:', response)
        } else {
          // Create new schedule
          console.log('Creating new work schedule')
          const response = await workScheduleService.createWorkSchedule(formData)
          console.log('Work schedule created successfully:', response)
        }
        
        await fetchWorkSchedules()
        closeModal()
      } catch (err) {
        console.error('Error saving work schedule:', err)
        console.error('Error response:', err.response?.data)
        console.error('Error status:', err.response?.status)
        
        if (err.response?.status === 422) {
          // Validation errors
          validationErrors.value = err.response.data.errors || {}
          console.log('Validation errors:', validationErrors.value)
          error.value = 'Please fix the validation errors below.'
        } else {
          error.value = err.response?.data?.message || 'Failed to save work schedule. Please try again.'
        }
      } finally {
        loading.value = false
      }
    }
    
    // Edit schedule
    const editSchedule = (schedule) => {
      console.log('Editing schedule:', schedule)
      editingSchedule.value = schedule
      scheduleForm.value = {
        name: schedule.name,
        start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : '',
        end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : '',
        late_grace_minutes: schedule.late_grace_minutes || ''
      }
      console.log('Form populated with:', scheduleForm.value)
      showAddModal.value = true
    }
    
    // View schedule details
    const viewSchedule = async (schedule) => {
      try {
        console.log('Fetching schedule details for ID:', schedule.id)
        const response = await workScheduleService.getWorkSchedule(schedule.id)
        console.log('Schedule details fetched:', response)
        selectedSchedule.value = response.data || response
        showDetailsModal.value = true
      } catch (err) {
        console.error('Error fetching schedule details:', err)
        // Fallback to table data if API fails
        selectedSchedule.value = schedule
        showDetailsModal.value = true
      }
    }
    
    // Delete schedule
    const deleteSchedule = async (schedule) => {
      if (!confirm(`Are you sure you want to delete "${schedule.name}"? This action cannot be undone.`)) {
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        console.log(`Deleting work schedule ${schedule.id}`)
        await workScheduleService.deleteWorkSchedule(schedule.id)
        console.log('Work schedule deleted successfully')
        await fetchWorkSchedules()
      } catch (err) {
        console.error('Error deleting work schedule:', err)
        error.value = err.response?.data?.message || 'Failed to delete work schedule. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    // Close modal
    const closeModal = () => {
      showAddModal.value = false
      editingSchedule.value = null
      scheduleForm.value = {
        name: '',
        start_time: '',
        end_time: '',
        late_grace_minutes: ''
      }
      validationErrors.value = {}
    }
    
    // Close details modal
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedSchedule.value = null
    }
    
    // Format time
    const formatTime = (timeString) => {
      if (!timeString) return 'N/A'
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
    
    // Calculate working hours
    const calculateWorkingHours = (startTime, endTime) => {
      if (!startTime || !endTime) return 0
      
      const start = new Date(`2000-01-01T${startTime}`)
      const end = new Date(`2000-01-01T${endTime}`)
      
      let diff = end - start
      if (diff < 0) {
        // Handle overnight schedules
        diff = (end.getTime() + 24 * 60 * 60 * 1000) - start.getTime()
      }
      
      return (diff / (1000 * 60 * 60)).toFixed(1)
    }
    
    // Fetch data on component mount
    onMounted(() => {
      fetchWorkSchedules()
    })
    
    return {
      workSchedules,
      allWorkSchedules,
      loading,
      error,
      showAddModal,
      showDetailsModal,
      editingSchedule,
      selectedSchedule,
      validationErrors,
      searchQuery,
      filters,
      scheduleForm,
      scheduleColumns,
      filterConfig,
      fetchWorkSchedules,
      applyFrontendFilters,
      handleFilterChange,
      clearFilters,
      saveSchedule,
      editSchedule,
      viewSchedule,
      deleteSchedule,
      closeModal,
      closeDetailsModal,
      formatTime,
      calculateWorkingHours
    }
  }
}
</script>

<style scoped>
.work-schedule-management {
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

.add-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.time-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.time-value {
  font-weight: 600;
  color: #6c757d;
  font-size: 16px;
}

.time-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.grace-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.grace-value {
  font-weight: 600;
  color: #6c757d;
  font-size: 16px;
}

.grace-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.employees-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.employees-count {
  font-weight: 600;
  color: #6c757d;
  font-size: 16px;
}

.employees-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.edit-btn {
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

.edit-btn:hover:not(:disabled) {
  background: #bee5eb;
  transform: translateY(-1px);
}

.view-btn {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn:hover:not(:disabled) {
  background: #d6d8db;
  transform: translateY(-1px);
}

.delete-btn {
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

.delete-btn:hover:not(:disabled) {
  background: #f5c6cb;
  transform: translateY(-1px);
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
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

.form-group input {
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.form-group input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.schedule-details {
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

.employee-item {
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 5px;
  border: 1px solid #e9ecef;
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
  
  .form-row {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
