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
 * Manager Service
 * Handles all manager-related API calls
 */
class ManagerService {
  
  /**
   * Get employees in manager's department
   * @returns {Promise} List of employees
   */
  async getEmployees() {
    try {
      const response = await apiClient.get('/manager/employees')
      return response.data
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  }
  
  /**
   * Assign employee to manager's department
   * @param {number} employeeId - Employee ID to assign
   * @returns {Promise} Assignment response
   */
  async assignEmployee(employeeId) {
    try {
      const response = await apiClient.put(`/manager/employees/${employeeId}/assign`)
      return response.data
    } catch (error) {
      console.error('Error assigning employee:', error)
      throw error
    }
  }
  
  /**
   * Remove employee from manager's department
   * @param {number} employeeId - Employee ID to remove
   * @returns {Promise} Removal response
   */
  async removeEmployee(employeeId) {
    try {
      const response = await apiClient.delete(`/manager/employees/${employeeId}/assign`)
      return response.data
    } catch (error) {
      console.error('Error removing employee:', error)
      throw error
    }
  }
  
  /**
   * Update employee work schedule
   * @param {number} employeeId - Employee ID
   * @param {number} scheduleId - Work schedule ID
   * @returns {Promise} Update response
   */
  async updateEmployeeSchedule(employeeId, scheduleId) {
    try {
      const response = await apiClient.put(`/manager/employees/${employeeId}/schedule`, {
        work_schedule_id: scheduleId
      })
      return response.data
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw error
    }
  }
  
  /**
   * Get department attendance
   * @returns {Promise} Department attendance data
   */
  async getDepartmentAttendance() {
    try {
      const response = await apiClient.get('/manager/attendance')
      return response.data
    } catch (error) {
      console.error('Error fetching department attendance:', error)
      throw error
    }
  }
  
  /**
   * Get all work schedules
   * @returns {Promise} Available work schedules
   */
  async getWorkSchedules() {
    try {
      const response = await apiClient.get('/work-schedules')
      return response.data
    } catch (error) {
      console.error('Error fetching work schedules:', error)
      throw error
    }
  }
  
  /**
   * Update leave request status (approve/reject)
   * @param {number} leaveId - Leave request ID
   * @param {string} status - New status (approved/rejected)
   * @param {string} reason - Reason for rejection (optional)
   * @returns {Promise} Update response
   */
  async updateLeaveStatus(leaveId, status, reason = '') {
    try {
      // Convert 'approved'/'rejected' to 'approve'/'reject' for backend
      const action = status === 'approved' ? 'approve' : 'reject'
      
      const response = await apiClient.put(`/leaves/${leaveId}/status`, {
        action,
        reason
      })
      return response.data
    } catch (error) {
      console.error('Error updating leave status:', error)
      throw error
    }
  }
  
  
  /**
   * Get department leave requests for manager (exclude manager's own requests)
   * @returns {Promise} Department leave requests
   */
  async getPendingLeaves() {
    try {
      const response = await apiClient.get('/department-leaves')
      return response.data
    } catch (error) {
      console.error('Error fetching department leaves:', error)
      throw error
    }
  }
  
  /**
   * Get team attendance records
   * @param {Object} filters - Query filters (optional)
   * @param {string} filters.date - Date filter
   * @param {string} filters.status - Status filter
   * @param {number} filters.page - Page number
   * @returns {Promise} Team attendance records
   */
  async getTeamAttendance(filters = {}) {
    try {
      const response = await apiClient.get('/manager/attendance', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching team attendance:', error)
      throw error
    }
  }
  
  /**
   * Assign employee to manager's department
   * @param {number} employeeId - Employee ID to assign
   * @returns {Promise} Assignment response
   */
  async assignEmployee(employeeId) {
    try {
      const response = await apiClient.put(`/manager/employees/${employeeId}/assign`)
      return response.data
    } catch (error) {
      console.error('Error assigning employee:', error)
      throw error
    }
  }
  
  /**
   * Get employees available for assignment (not in manager's department)
   * @returns {Promise} Available employees
   */
  async getEmployeesForAssignment() {
    try {
      const response = await apiClient.get('/manager/employees/available-for-assignment')
      return response.data
    } catch (error) {
      console.error('Error fetching employees for assignment:', error)
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

export default new ManagerService()
