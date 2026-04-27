import axios from 'axios'

const API_URL = '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // ==================== LEAVE TYPES MANAGEMENT ====================
  
  /**
   * Get all leave types with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.per_page - Items per page (default: 10)
   * @param {number} params.page - Page number (default: 1)
   * @param {string} params.search - Search term
   * @param {boolean} params.is_paid - Filter by paid/unpaid
   * @returns {Promise} Paginated leave types
   */
  async getLeaveTypes(params = {}) {
    console.log('Fetching leave types with params:', params)
    const response = await apiClient.get('/leave-types', { params })
    console.log('Leave types response:', response)
    return response.data
  },

  /**
   * Get specific leave type by ID
   * @param {number} id - Leave type ID
   * @returns {Promise} Leave type details
   */
  async getLeaveType(id) {
    console.log(`Fetching leave type ${id}`)
    const response = await apiClient.get(`/leave-types/${id}`)
    console.log('Leave type response:', response)
    return response.data
  },

  /**
   * Create new leave type
   * @param {Object} leaveTypeData - Leave type data
   * @param {string} leaveTypeData.name - Leave type name (required)
   * @param {number} leaveTypeData.max_days - Maximum days (required)
   * @param {boolean} leaveTypeData.is_paid - Is paid leave (required)
   * @param {string} leaveTypeData.description - Description (optional)
   * @returns {Promise} Created leave type
   */
  async createLeaveType(leaveTypeData) {
    console.log('Creating leave type:', leaveTypeData)
    const response = await apiClient.post('/leave-types', leaveTypeData)
    console.log('Leave type created:', response)
    return response.data
  },

  /**
   * Update existing leave type
   * @param {number} id - Leave type ID
   * @param {Object} leaveTypeData - Updated leave type data
   * @returns {Promise} Updated leave type
   */
  async updateLeaveType(id, leaveTypeData) {
    console.log(`Updating leave type ${id}:`, leaveTypeData)
    const response = await apiClient.put(`/leave-types/${id}`, leaveTypeData)
    console.log('Leave type updated:', response)
    return response.data
  },

  /**
   * Delete leave type
   * @param {number} id - Leave type ID
   * @returns {Promise} Deletion confirmation
   */
  async deleteLeaveType(id) {
    console.log(`Deleting leave type ${id}`)
    const response = await apiClient.delete(`/leave-types/${id}`)
    console.log('Leave type deleted:', response)
    return response.data
  },

  // ==================== LEAVE REQUESTS MANAGEMENT ====================
  
  /**
   * Get all leave requests (admin view)
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status (pending, approved, rejected)
   * @param {number} params.leave_type_id - Filter by leave type
   * @param {number} params.employee_id - Filter by employee
   * @param {string} params.start_date - Filter by start date
   * @param {string} params.end_date - Filter by end date
   * @param {number} params.per_page - Items per page (default: 10)
   * @param {number} params.page - Page number (default: 1)
   * @returns {Promise} Paginated leave requests
   */
  async getLeaveRequests(params = {}) {
    console.log('Fetching leave requests with params:', params)
    const response = await apiClient.get('/leaves', { params })
    console.log('Leave requests response:', response)
    return response.data
  },

  /**
   * Get specific leave request by ID
   * @param {number} id - Leave request ID
   * @returns {Promise} Leave request details
   */
  async getLeaveRequest(id) {
    console.log(`Fetching leave request ${id}`)
    const response = await apiClient.get(`/leaves/${id}`)
    console.log('Leave request response:', response)
    return response.data
  },

  /**
   * Update leave request status (approve/reject)
   * @param {number} id - Leave request ID
   * @param {string} action - Action to perform (approve/reject)
   * @param {string} reason - Reason for rejection (optional)
   * @returns {Promise} Updated leave request
   */
  async updateLeaveStatus(id, action, reason = '') {
    console.log(`Updating leave ${id} status to: ${action}`)
    const response = await apiClient.put(`/leaves/${id}/status`, {
      action,
      reason
    })
    console.log('Leave status updated:', response)
    return response.data
  },

  /**
   * Get leave statistics for dashboard
   * @param {Object} params - Query parameters
   * @param {string} params.period - Period (month, quarter, year)
   * @param {number} params.department_id - Filter by department
   * @returns {Promise} Leave statistics
   */
  async getLeaveStatistics(params = {}) {
    console.log('Fetching leave statistics with params:', params)
    const response = await apiClient.get('/leave-statistics', { params })
    console.log('Leave statistics response:', response)
    return response.data
  },

  /**
   * Get leave calendar data
   * @param {Object} params - Query parameters
   * @param {string} params.month - Month (YYYY-MM)
   * @param {number} params.department_id - Filter by department
   * @returns {Promise} Calendar data
   */
  async getLeaveCalendar(params = {}) {
    console.log('Fetching leave calendar with params:', params)
    const response = await apiClient.get('/leave-calendar', { params })
    console.log('Leave calendar response:', response)
    return response.data
  },

  /**
   * Get employee leave balance
   * @param {number} employeeId - Employee ID
   * @returns {Promise} Employee leave balance
   */
  async getEmployeeLeaveBalance(employeeId) {
    console.log(`Fetching leave balance for employee ${employeeId}`)
    const response = await apiClient.get(`/employees/${employeeId}/leave-balance`)
    console.log('Leave balance response:', response)
    return response.data
  },

  /**
   * Export leave requests to CSV/PDF
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (csv, pdf)
   * @param {Object} params.filters - Filters to apply
   * @returns {Promise} Export file
   */
  async exportLeaveRequests(params = {}) {
    console.log('Exporting leave requests with params:', params)
    const response = await apiClient.get('/leaves/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Leave requests exported:', response)
    return response.data
  }
}
