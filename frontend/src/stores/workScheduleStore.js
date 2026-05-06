import { defineStore } from 'pinia'
import workScheduleService from '@/services/workScheduleService'

export const useWorkScheduleStore = defineStore('workSchedule', {
  state: () => ({
    // Data
    workSchedules: [],
    allWorkSchedules: [],
    editingSchedule: null,
    selectedSchedule: null,
    
    // Loading states
    loading: false,
    
    // Error state
    error: '',
    validationErrors: {},
    
    // Modal states
    showAddModal: false,
    showDetailsModal: false,
    
    // Search and filters
    searchQuery: '',
    filters: {
      has_employees: ''
    },
    
    // Form data
    scheduleForm: {
      name: '',
      start_time: '',
      end_time: '',
      late_grace_minutes: ''
    }
  }),

  getters: {
    // Columns definitions
    scheduleColumns() {
      return [
        { key: 'name', label: 'Schedule Name' },
        { key: 'start_time', label: 'Start Time' },
        { key: 'end_time', label: 'End Time' },
        { key: 'late_grace_minutes', label: 'Grace Period' },
        { key: 'employees_count', label: 'Employees' },
        { key: 'actions', label: 'Actions' }
      ]
    },
    
    // Filter configuration
    filterConfig() {
      return [
        {
          key: 'has_employees',
          placeholder: 'All Schedules',
          options: [
            { value: 'has', label: 'Has Employees' },
            { value: 'none', label: 'No Employees' }
          ]
        }
      ]
    }
  },

  actions: {
    // Fetch work schedules
    async fetchWorkSchedules(params = {}) {
      this.loading = true
      this.error = ''
      
      try {
        console.log('Fetching work schedules...')
        const response = await workScheduleService.getWorkSchedules({ per_page: 50, ...params })
        console.log('Work schedules fetched:', response)
        
        // Extract data from response (it's nested in response.data.data)
        const data = response.data?.data || response.data || response
        
        // Ensure data is an array
        this.allWorkSchedules = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        
        console.log('Processed data:', this.allWorkSchedules)
        
        // Apply frontend filtering
        this.applyFrontendFilters()
        
        console.log('Work schedules assigned:', this.allWorkSchedules)
      } catch (err) {
        console.error('Error fetching work schedules:', err)
        this.error = err.response?.data?.message || 'Failed to fetch work schedules. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    // Apply frontend filtering
    applyFrontendFilters() {
      if (!Array.isArray(this.allWorkSchedules)) {
        this.workSchedules = []
        return
      }
      
      let filteredSchedules = [...this.allWorkSchedules]
      
      // Apply search filter
      if (this.searchQuery.trim()) {
        filteredSchedules = filteredSchedules.filter(schedule => 
          schedule.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim())
        )
      }
      
      // Apply employees filter
      if (this.filters.has_employees) {
        if (this.filters.has_employees === 'has') {
          filteredSchedules = filteredSchedules.filter(schedule => 
            schedule.employees_count > 0
          )
        } else if (this.filters.has_employees === 'none') {
          filteredSchedules = filteredSchedules.filter(schedule => 
            !schedule.employees_count || schedule.employees_count === 0
          )
        }
      }
      
      this.workSchedules = filteredSchedules
    },
    
    // Update filters
    handleFilterChange(filterData) {
      this.searchQuery = filterData.search
      this.filters = filterData.filters
      this.applyFrontendFilters()
    },
    
    // Clear filters
    clearFilters() {
      this.searchQuery = ''
      this.filters = {
        has_employees: ''
      }
      this.applyFrontendFilters()
    },
    
    // Save work schedule (create or update)
    async saveSchedule() {
      this.loading = true
      this.error = ''
      this.validationErrors = {}
      
      try {
        // Prepare form data
        const formData = {
          name: this.scheduleForm.name.trim(),
          start_time: this.scheduleForm.start_time ? this.scheduleForm.start_time.substring(0, 5) : '',
          end_time: this.scheduleForm.end_time ? this.scheduleForm.end_time.substring(0, 5) : '',
          late_grace_minutes: this.scheduleForm.late_grace_minutes || null
        }
        
        console.log('Saving work schedule:', formData)
        console.log('Editing schedule ID:', this.editingSchedule?.id)
        console.log('Form values:', this.scheduleForm)
        
        if (this.editingSchedule) {
          // Update existing schedule
          console.log('Updating work schedule ID:', this.editingSchedule.id)
          const response = await workScheduleService.updateWorkSchedule(this.editingSchedule.id, formData)
          console.log('Work schedule updated successfully:', response)
        } else {
          // Create new schedule
          console.log('Creating new work schedule')
          const response = await workScheduleService.createWorkSchedule(formData)
          console.log('Work schedule created successfully:', response)
        }
        
        await this.fetchWorkSchedules()
        this.closeModal()
      } catch (err) {
        console.error('Error saving work schedule:', err)
        console.error('Error response:', err.response?.data)
        console.error('Error status:', err.response?.status)
        
        if (err.response?.status === 422) {
          // Validation errors
          this.validationErrors = err.response.data.errors || {}
          console.log('Validation errors:', this.validationErrors)
          this.error = 'Please fix validation errors below.'
        } else {
          this.error = err.response?.data?.message || 'Failed to save work schedule. Please try again.'
        }
      } finally {
        this.loading = false
      }
    },
    
    // Edit schedule
    editSchedule(schedule) {
      console.log('Editing schedule:', schedule)
      this.editingSchedule = schedule
      this.scheduleForm = {
        name: schedule.name,
        start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : '',
        end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : '',
        late_grace_minutes: schedule.late_grace_minutes || ''
      }
      console.log('Form populated with:', this.scheduleForm)
      this.showAddModal = true
    },
    
    // View schedule details
    async viewSchedule(schedule) {
      try {
        console.log('Fetching schedule details for ID:', schedule.id)
        const response = await workScheduleService.getWorkSchedule(schedule.id)
        console.log('Schedule details fetched:', response)
        this.selectedSchedule = response.data || response
        this.showDetailsModal = true
      } catch (err) {
        console.error('Error fetching schedule details:', err)
        // Fallback to table data if API fails
        this.selectedSchedule = schedule
        this.showDetailsModal = true
      }
    },
    
    // Delete schedule
    async deleteSchedule(schedule) {
      this.loading = true
      this.error = ''
      
      try {
        console.log(`Deleting work schedule ${schedule.id}`)
        await workScheduleService.deleteWorkSchedule(schedule.id)
        console.log('Work schedule deleted successfully')
        await this.fetchWorkSchedules()
      } catch (err) {
        console.error('Error deleting work schedule:', err)
        this.error = err.response?.data?.message || 'Failed to delete work schedule. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    // Modal management
    openAddModal() {
      this.showAddModal = true
    },
    
    closeAddModal() {
      this.showAddModal = false
    },
    
    closeModal() {
      this.showAddModal = false
      this.editingSchedule = null
      this.scheduleForm = {
        name: '',
        start_time: '',
        end_time: '',
        late_grace_minutes: ''
      }
      this.validationErrors = {}
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedSchedule = null
    },
    
    // Form update methods
    updateScheduleForm(field, value) {
      this.scheduleForm[field] = value
    },
    
    // Helper methods
    formatTime(timeString) {
      if (!timeString) return 'N/A'
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    },
    
    calculateWorkingHours(startTime, endTime) {
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
  }
})
