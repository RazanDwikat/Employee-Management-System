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
  // ==================== WORK SCHEDULES MANAGEMENT ====================
  
  /**
   * Get all work schedules with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.per_page - Items per page (default: 5)
   * @param {number} params.page - Page number (default: 1)
   * @param {string} params.search - Search term
   * @returns {Promise} Paginated work schedules
   */
  async getWorkSchedules(params = {}) {
    console.log('Fetching work schedules with params:', params)
    const response = await apiClient.get('/work-schedules', { params })
    console.log('Work schedules response:', response)
    return response.data
  },

  /**
   * Get specific work schedule by ID
   * @param {number} id - Work schedule ID
   * @returns {Promise} Work schedule details
   */
  async getWorkSchedule(id) {
    console.log(`Fetching work schedule ${id}`)
    const response = await apiClient.get(`/work-schedules/${id}`)
    console.log('Work schedule response:', response)
    return response.data
  },

  /**
   * Create new work schedule
   * @param {Object} scheduleData - Work schedule data
   * @param {string} scheduleData.name - Schedule name (required, max 100 chars)
   * @param {string} scheduleData.start_time - Start time in HH:i format (required)
   * @param {string} scheduleData.end_time - End time in HH:i format (required, after start_time)
   * @param {number} scheduleData.late_grace_minutes - Grace minutes for late arrival (optional, min 0)
   * @returns {Promise} Created work schedule
   */
  async createWorkSchedule(scheduleData) {
    console.log('Creating work schedule:', scheduleData)
    const response = await apiClient.post('/work-schedules', scheduleData)
    console.log('Work schedule created:', response)
    return response.data
  },

  /**
   * Update existing work schedule
   * @param {number} id - Work schedule ID
   * @param {Object} scheduleData - Updated work schedule data
   * @returns {Promise} Updated work schedule
   */
  async updateWorkSchedule(id, scheduleData) {
    console.log(`Updating work schedule ${id}:`, scheduleData)
    const response = await apiClient.put(`/work-schedules/${id}`, scheduleData)
    console.log('Work schedule updated:', response)
    return response.data
  },

  /**
   * Delete work schedule
   * @param {number} id - Work schedule ID
   * @returns {Promise} Deletion confirmation
   */
  async deleteWorkSchedule(id) {
    console.log(`Deleting work schedule ${id}`)
    const response = await apiClient.delete(`/work-schedules/${id}`)
    console.log('Work schedule deleted:', response)
    return response.data
  },

  /**
   * Get employees assigned to a work schedule
   * @param {number} scheduleId - Work schedule ID
   * @returns {Promise} List of employees
   */
  async getScheduleEmployees(scheduleId) {
    console.log(`Fetching employees for schedule ${scheduleId}`)
    const response = await apiClient.get(`/work-schedules/${scheduleId}/employees`)
    console.log('Schedule employees response:', response)
    return response.data
  },

  /**
   * Assign work schedule to employees
   * @param {number} scheduleId - Work schedule ID
   * @param {Array} employeeIds - Array of employee IDs
   * @returns {Promise} Assignment confirmation
   */
  async assignScheduleToEmployees(scheduleId, employeeIds) {
    console.log(`Assigning schedule ${scheduleId} to employees:`, employeeIds)
    const response = await apiClient.post(`/work-schedules/${scheduleId}/assign`, {
      employee_ids: employeeIds
    })
    console.log('Schedule assigned:', response)
    return response.data
  },

  /**
   * Remove work schedule from employees
   * @param {number} scheduleId - Work schedule ID
   * @param {Array} employeeIds - Array of employee IDs
   * @returns {Promise} Removal confirmation
   */
  async removeScheduleFromEmployees(scheduleId, employeeIds) {
    console.log(`Removing schedule ${scheduleId} from employees:`, employeeIds)
    const response = await apiClient.post(`/work-schedules/${scheduleId}/remove`, {
      employee_ids: employeeIds
    })
    console.log('Schedule removed:', response)
    return response.data
  },

  /**
   * Get work schedule statistics
   * @returns {Promise} Schedule statistics
   */
  async getScheduleStatistics() {
    console.log('Fetching work schedule statistics')
    const response = await apiClient.get('/work-schedules/statistics')
    console.log('Schedule statistics response:', response)
    return response.data
  },

  /**
   * Export work schedules to CSV/PDF
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (csv, pdf)
   * @param {Object} params.filters - Filters to apply
   * @returns {Promise} Export file
   */
  async exportWorkSchedules(params = {}) {
    console.log('Exporting work schedules with params:', params)
    const response = await apiClient.get('/work-schedules/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Work schedules exported:', response)
    return response.data
  }
}
