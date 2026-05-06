import { defineStore } from 'pinia'
import employeeService from '@/services/employeeService'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    // Profile data
    profile: null,
    
    // Leaves data
    leaves: [],
    leaveTypes: [],
    leavePagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0
    },
    
    // Attendance data
    todayAttendance: null,
    attendanceHistory: [],
    attendanceStats: {
      present: 0,
      late: 0,
      absent: 0,
      percentage: 0
    },
    attendancePagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0
    },
    attendanceFilters: {
      month: '',
      year: ''
    },
    
    // Dashboard data
    dashboardStats: {
      present_days: 0,
      late_days: 0,
      absent_days: 0,
      leaves_this_month: 0,
      today_status: 'not_checked_in',
      total_work_days: 0
    },
    
    // Salaries data
    salaries: [],
    
    // Salary filters
    salaryFilters: {
      month: '',
      year: ''
    },
    
    // Expanded salary ID
    expandedSalaryId: null,
    
    // Profile form data
    profileForm: {
      name: '',
      email: '',
      phone: '',
      address: '',
      current_password: '',
      password: '',
      password_confirmation: ''
    },
    
    // Loading states
    loading: {
      profile: false,
      leaves: false,
      attendance: false,
      dashboard: false,
      checkIn: false,
      checkOut: false,
      submitting: false,
      cancelling: false
    },
    
    // Message states
    message: '',
    messageType: 'success',
    
    // Forms
    leaveForm: {
      leave_type_id: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      description: ''
    },
    
    // Filters
    leaveFilters: {
      status: '',
      year: ''
    }
  }),

  getters: {
    // Computed properties for options
    months() {
      return [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    },
    
    availableYears() {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - i)
    },
    
    monthOptions() {
      return [
        { value: '', label: 'All Months' },
        ...this.months.map((month, index) => ({ value: index + 1, label: month }))
      ]
    },
    
    yearOptions() {
      return [
        { value: '', label: 'All Years' },
        ...this.availableYears.map(year => ({ value: year, label: year.toString() }))
      ]
    },
    
    minDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    }
  },

  actions: {
    // Profile actions
    async updateProfile(profileData) {
      try {
        this.loading.profile = true
        const response = await employeeService.updateProfile(profileData)
        return response
      } catch (err) {
        console.error('Error updating profile:', err)
        throw err
      } finally {
        this.loading.profile = false
      }
    },
    
    async getProfile() {
      try {
        this.loading.profile = true
        const response = await employeeService.getProfile()
        this.profile = response
        return response
      } catch (err) {
        console.error('Error fetching profile:', err)
        throw err
      } finally {
        this.loading.profile = false
      }
    },
    
    // Leave actions
    async loadLeaveTypes() {
      try {
        const response = await employeeService.getLeaveTypes()
        this.leaveTypes = response.data || []
      } catch (error) {
        console.error('Error loading leave types:', error)
      }
    },
    
    async loadLeaves(page = 1) {
      try {
        this.loading.leaves = true
        
        const params = {
          page,
          ...this.leaveFilters
        }
        
        const response = await employeeService.getLeaves(params)
        this.leaves = response.data || []
        
        if (response.meta) {
          this.leavePagination = response.meta
        }
        
      } catch (error) {
        console.error('Error loading leaves:', error)
        this.showMessage('Error loading leave requests', 'error')
      } finally {
        this.loading.leaves = false
      }
    },
    
    async submitLeave(leaveData) {
      try {
        this.loading.submitting = true
        
        console.log('Submitting leave data:', leaveData)
        const response = await employeeService.submitLeave(leaveData)
        console.log('Leave submit response:', response)
        
        // Reset form
        this.resetLeaveForm()
        
        // Reload leaves
        await this.loadLeaves()
        
        this.showMessage('Leave request submitted successfully!', 'success')
        
      } catch (error) {
        console.error('Error submitting leave:', error)
        this.showMessage(error.response?.data?.message || 'Error submitting leave request', 'error')
        throw error
      } finally {
        this.loading.submitting = false
      }
    },
    
    async cancelLeave(leaveId) {
      try {
        this.loading.cancelling = true
        
        await employeeService.cancelLeave(leaveId)
        
        // Reload leaves
        await this.loadLeaves()
        
        this.showMessage('Leave request cancelled successfully!', 'success')
        
      } catch (error) {
        console.error('Error cancelling leave:', error)
        this.showMessage(error.response?.data?.message || 'Error cancelling leave request', 'error')
        throw error
      } finally {
        this.loading.cancelling = false
      }
    },
    
    // Attendance actions
    async loadTodayAttendance() {
      try {
        this.todayAttendance = await employeeService.getTodayAttendance()
      } catch (error) {
        console.error('Error loading today attendance:', error)
      }
    },
    
    async loadAttendanceHistory(page = 1) {
      try {
        this.loading.attendance = true
        
        const params = {
          page,
          ...this.attendanceFilters
        }
        
        const response = await employeeService.getAttendanceHistory(params)
        this.attendanceHistory = response.data || []
        
        if (response.meta) {
          this.attendancePagination = response.meta
        }
        
        // Calculate stats
        this.calculateAttendanceStats()
        
      } catch (error) {
        console.error('Error loading attendance history:', error)
        this.showMessage('Error loading attendance history', 'error')
      } finally {
        this.loading.attendance = false
      }
    },
    
    async handleCheckIn() {
      try {
        this.loading.checkIn = true
        
        const response = await employeeService.checkIn()
        this.todayAttendance = response.attendance
        
        this.showMessage('Checked in successfully!', 'success')
        
        // Refresh data immediately
        await this.loadTodayAttendance()
        await this.loadAttendanceHistory()
        
      } catch (error) {
        console.error('Error checking in:', error)
        this.showMessage(error.response?.data?.message || 'Error checking in', 'error')
        throw error
      } finally {
        this.loading.checkIn = false
      }
    },
    
    async handleCheckOut() {
      try {
        this.loading.checkOut = true
        
        const response = await employeeService.checkOut()
        this.todayAttendance = response.attendance
        
        this.showMessage('Checked out successfully!', 'success')
        
        // Refresh data immediately
        await this.loadTodayAttendance()
        await this.loadAttendanceHistory()
        
      } catch (error) {
        console.error('Error checking out:', error)
        this.showMessage(error.response?.data?.message || 'Error checking out', 'error')
        throw error
      } finally {
        this.loading.checkOut = false
      }
    },
    
    // Dashboard actions
    async loadDashboardStats() {
      try {
        this.loading.dashboard = true
        
        const dashboardData = await employeeService.getDashboardStats()
        this.dashboardStats = dashboardData.stats
        
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        this.loading.dashboard = false
      }
    },
    
    // Salary actions
    async loadSalaries(filters = {}) {
      try {
        const response = await employeeService.getMySalaries(filters)
        this.salaries = response.data || []
        return response
      } catch (error) {
        console.error('Error loading salaries:', error)
        throw error
      }
    },
    
    // Helper methods
    calculateAttendanceStats() {
      const records = this.attendanceHistory
      const total = records.length
      
      if (total === 0) {
        this.attendanceStats = { present: 0, late: 0, absent: 0, percentage: 0 }
        return
      }
      
      const present = records.filter(r => r.status === 'present').length
      const late = records.filter(r => r.status === 'late').length
      const absent = records.filter(r => r.status === 'absent').length
      
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0
      
      this.attendanceStats = { present, late, absent, percentage }
    },
    
    showMessage(text, type = 'success') {
      this.message = text
      this.messageType = type
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        this.message = ''
      }, 5000)
    },
    
    // Form update methods
    updateLeaveForm(field, value) {
      this.leaveForm[field] = value
    },
    
    updateLeaveFilters(field, value) {
      this.leaveFilters[field] = value
    },
    
    updateAttendanceFilters(field, value) {
      this.attendanceFilters[field] = value
    },
    
    updateProfileForm(field, value) {
      this.profileForm[field] = value
    },
    
    resetLeaveForm() {
      this.leaveForm = {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        description: ''
      }
      this.message = ''
    },
    
    // Service helper methods
    formatDate(dateString) {
      return employeeService.formatDate(dateString)
    },
    
    formatTime(timeString) {
      return employeeService.formatTime(timeString)
    },
    
    getLeaveStatusClass(status) {
      return employeeService.getLeaveStatusColor(status)
    },
    
    getAttendanceStatusClass(status) {
      return employeeService.getAttendanceStatusColor(status)
    },
    
    getStatusIcon(status) {
      const icons = {
        present: '✅',
        late: '⏰',
        absent: '❌',
        null: '⏳'
      }
      return icons[status] || '⏳'
    },
    
    getStatusIconClass(status) {
      const classes = {
        present: 'success',
        late: 'warning',
        absent: 'danger',
        null: 'pending'
      }
      return classes[status] || 'pending'
    },
    
    getStatusText(status) {
      const texts = {
        present: 'Present',
        late: 'Late',
        absent: 'Absent',
        null: 'Not Recorded'
      }
      return texts[status] || 'Not Recorded'
    },
    
    calculateDuration(checkIn, checkOut) {
      if (!checkIn || !checkOut) return '--'
      
      try {
        // Extract time from datetime string
        const extractTime = (dateTimeStr) => {
          if (!dateTimeStr) return null
          
          // If it's a full datetime string, extract the time part
          if (typeof dateTimeStr === 'string') {
            // Handle "YYYY-MM-DD HH:MM:SS" format
            if (dateTimeStr.includes(' ')) {
              const timePart = dateTimeStr.split(' ')[1]
              if (timePart && timePart.includes(':')) {
                return timePart
              }
            }
            
            // Handle "HH:MM:SS" format directly
            if (dateTimeStr.includes(':')) {
              return dateTimeStr
            }
          }
          
          return dateTimeStr
        }
        
        const checkInTime = extractTime(checkIn)
        const checkOutTime = extractTime(checkOut)
        
        if (!checkInTime || !checkOutTime) {
          return '--'
        }
        
        // Create date objects with the same date but different times
        const inTime = new Date(`2000-01-01T${checkInTime}`)
        const outTime = new Date(`2000-01-01T${checkOutTime}`)
        
        // Check if dates are valid
        if (isNaN(inTime.getTime()) || isNaN(outTime.getTime())) {
          console.warn('Invalid time format:', { checkIn, checkOut, checkInTime, checkOutTime })
          return '--'
        }
        
        const diff = outTime - inTime
        
        // Check if difference is negative (checkout before checkin)
        if (diff < 0) {
          return '--'
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        return `${hours}h ${minutes}m`
      } catch (error) {
        console.error('Error calculating duration:', error, { checkIn, checkOut })
        return '--'
      }
    },
    
    // Initialize methods
    async initializeLeaves() {
      await Promise.all([
        this.loadLeaveTypes(),
        this.loadLeaves()
      ])
    },
    
    async initializeAttendance() {
      await Promise.all([
        this.loadTodayAttendance(),
        this.loadAttendanceHistory()
      ])
    },
    
    async initializeDashboard() {
      await Promise.all([
        this.loadDashboardStats(),
        this.loadTodayAttendance(),
        this.loadLeaves({ limit: 5 })
      ])
    }
  }
})
