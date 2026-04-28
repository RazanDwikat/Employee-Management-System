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
 * Reports Service
 * Handles all report-related API calls
 */
class ReportService {
  
  /**
   * Get employee report
   * @returns {Promise} Employee report data
   */
  async getEmployeeReport() {
    try {
      const response = await apiClient.get('/reports/employees')
      return response.data
    } catch (error) {
      console.error('Error fetching employee report:', error)
      throw error
    }
  }
  
  /**
   * Get department distribution report
   * @returns {Promise} Department distribution data
   */
  async getDepartmentReport() {
    try {
      const response = await apiClient.get('/reports/departments')
      return response.data
    } catch (error) {
      console.error('Error fetching department report:', error)
      throw error
    }
  }
  
  /**
   * Get attendance report
   * @param {Object} filters - Attendance filters (month, year, employee_id, department_id)
   * @returns {Promise} Attendance report data
   */
  async getAttendanceReport(filters) {
    try {
      const response = await apiClient.get('/reports/attendance', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching attendance report:', error)
      throw error
    }
  }
  
  /**
   * Get salary insights report
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {Promise} Salary insights data
   */
  async getSalaryReport(month, year) {
    try {
      const response = await apiClient.get('/reports/salaries', { 
        params: { month, year } 
      })
      return response.data
    } catch (error) {
      console.error('Error fetching salary report:', error)
      throw error
    }
  }
  
  /**
   * Get leave insights report
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {Promise} Leave insights data
   */
  async getLeaveReport(month, year) {
    try {
      const response = await apiClient.get('/reports/leaves', { 
        params: { month, year } 
      })
      return response.data
    } catch (error) {
      console.error('Error fetching leave report:', error)
      throw error
    }
  }
  
  /**
   * Download attendance report as PDF
   * @param {Object} filters - Attendance filters (month, year, employee_id, department_id)
   * @returns {Promise} PDF download
   */
  async downloadAttendancePdf(filters) {
    try {
      const response = await apiClient.get('/reports/attendance/pdf', { 
        params: filters,
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance-${filters.month}-${filters.year}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return response
    } catch (error) {
      console.error('Error downloading attendance PDF:', error)
      throw error
    }
  }
  
  /**
   * Format currency amount
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }
  
  /**
   * Get month name
   * @param {number} month - Month number (1-12)
   * @returns {string} Month name
   */
  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }
  
  /**
   * Get attendance status color
   * @param {string} status - Attendance status
   * @returns {string} Color class
   */
  getAttendanceStatusColor(status) {
    const colors = {
      present: 'text-green-600 bg-green-100',
      late: 'text-yellow-600 bg-yellow-100',
      absent: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
  
  /**
   * Get leave status color
   * @param {string} status - Leave status
   * @returns {string} Color class
   */
  getLeaveStatusColor(status) {
    const colors = {
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      pending: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
}

export default new ReportService()
