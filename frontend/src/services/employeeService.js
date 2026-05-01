import axios from 'axios'

const API_URL = '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Employee Service
 * Handles all employee-related API calls
 */
class EmployeeService {
  
  /**
   * Update employee profile
   * @param {Object} profileData - Profile update data
   * @param {string} profileData.email - Email address
   * @param {string} profileData.password - New password (optional)
   * @param {string} profileData.phone - Phone number
   * @param {string} profileData.address - Address
   * @returns {Promise} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      console.log('Frontend: Sending profile update request', {
        url: '/profile',
        data: profileData
      })
      
      const response = await apiClient.put('/profile', profileData)
      
      console.log('Frontend: Profile update response', response.data)
      
      return response.data
    } catch (error) {
      console.error('Frontend: Error updating profile:', error)
      console.log('Frontend: Error details', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      throw error
    }
  }
  
  /**
   * Submit leave request
   * @param {Object} leaveData - Leave request data
   * @param {number} leaveData.leave_type_id - Leave type ID
   * @param {string} leaveData.description - Leave description
   * @param {string} leaveData.start_date - Start date (YYYY-MM-DD)
   * @param {string} leaveData.end_date - End date (YYYY-MM-DD)
   * @param {string} leaveData.start_time - Start time (HH:mm, optional)
   * @param {string} leaveData.end_time - End time (HH:mm, optional)
   * @returns {Promise} Created leave request
   */
  async submitLeave(leaveData) {
    try {
      const response = await apiClient.post('/leaves', leaveData)
      return response.data
    } catch (error) {
      console.error('Error submitting leave:', error)
      throw error
    }
  }
  
  /**
   * Get employee leaves list
   * @param {Object} filters - Query filters (optional)
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.status - Leave status filter
   * @returns {Promise} Paginated leaves list
   */
  async getLeaves(filters = {}) {
    try {
      const response = await apiClient.get('/leaves', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching leaves:', error)
      throw error
    }
  }
  
  /**
   * Cancel leave request
   * @param {number} leaveId - Leave ID to cancel
   * @returns {Promise} Cancellation response
   */
  async cancelLeave(leaveId) {
    try {
      const response = await apiClient.delete(`/leaves/${leaveId}`)
      return response.data
    } catch (error) {
      console.error('Error canceling leave:', error)
      throw error
    }
  }
  
  /**
   * Check in attendance
   * @returns {Promise} Check-in response with attendance data
   */
  async checkIn() {
    try {
      const response = await apiClient.post('/attendance/check-in')
      return response.data
    } catch (error) {
      console.error('Error checking in:', error)
      throw error
    }
  }
  
  /**
   * Check out attendance
   * @returns {Promise} Check-out response with attendance data
   */
  async checkOut() {
    try {
      const response = await apiClient.post('/attendance/check-out')
      return response.data
    } catch (error) {
      console.error('Error checking out:', error)
      throw error
    }
  }
  
  /**
   * Get employee salaries
   * @param {Object} filters - Query filters (optional)
   * @param {number} filters.month - Month filter (1-12)
   * @param {number} filters.year - Year filter
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise} Paginated salaries list
   */
  async getMySalaries(filters = {}) {
    try {
      const response = await apiClient.get('/my-salaries', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching salaries:', error)
      throw error
    }
  }
  
  /**
   * Get current employee profile with employee data
   * @returns {Promise} Current employee profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/profile')
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }
  
  /**
   * Get today's attendance status
   * @returns {Promise} Today's attendance data
   */
  async getTodayAttendance() {
    try {
      const response = await apiClient.get('/attendance/today')
      return response.data
    } catch (error) {
      console.error('Error fetching today attendance:', error)
      throw error
    }
  }
  
  /**
   * Get attendance history
   * @param {Object} filters - Query filters (optional)
   * @param {number} filters.month - Month filter (1-12)
   * @param {number} filters.year - Year filter
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise} Paginated attendance history
   */
  async getAttendanceHistory(filters = {}) {
    try {
      const response = await apiClient.get('/attendance/history', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching attendance history:', error)
      throw error
    }
  }
  
  /**
   * Get leave types
   * @returns {Promise} Available leave types
   */
  async getLeaveTypes() {
    try {
    
      const response = await apiClient.get('/leave-types')
     
      return response.data
    } catch (error) {
  
      throw error
    }
  }
  
  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats for employee
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }
  
  /**
   * Get employee salaries
   * @returns {Promise} API response with salary data
   */
  async getSalaries() {
    try {
      const response = await apiClient.get('/my-salaries')
      return response.data
    } catch (error) {
      console.error('Error fetching salaries:', error)
      throw error
    }
  }
  
  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  /**
   * Format time for display
   * @param {string} timeString - Time string
   * @returns {string} Formatted time
   */
  formatTime(timeString) {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  /**
   * Get leave status color class
   * @param {string} status - Leave status
   * @returns {string} CSS class for status
   */
  getLeaveStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
  
  /**
   * Get attendance status color class
   * @param {string} status - Attendance status
   * @returns {string} CSS class for status
   */
  getAttendanceStatusColor(status) {
    const colors = {
      present: 'text-green-600 bg-green-100',
      late: 'text-yellow-600 bg-yellow-100',
      absent: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
}

export default new EmployeeService()
