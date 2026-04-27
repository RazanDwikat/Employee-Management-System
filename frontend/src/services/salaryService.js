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
  // ==================== SALARY MANAGEMENT ====================
  
  /**
   * Set employee salary
   * @param {Object} salaryData - Salary data
   * @param {number} salaryData.employee_id - Employee ID (required)
   * @param {number} salaryData.base_salary - Base salary (required, min: 0)
   * @param {string} salaryData.effective_from - Effective date (required, date)
   * @returns {Promise} Created salary record
   */
  async setEmployeeSalary(salaryData) {
    console.log('Setting employee salary:', salaryData)
    const response = await apiClient.post('/salaries', salaryData)
    console.log('Employee salary set:', response)
    return response.data
  },

  /**
   * Update employee salary
   * @param {number} employeeId - Employee ID
   * @param {Object} salaryData - Updated salary data
   * @returns {Promise} Updated salary record
   */
  async updateEmployeeSalary(employeeId, salaryData) {
    console.log(`Updating salary for employee ${employeeId}:`, salaryData)
    const response = await apiClient.post(`/employees/${employeeId}/salary`, salaryData)
    console.log('Employee salary updated:', response)
    return response.data
  },

  // ==================== SALARY TRACKING ====================
  
  /**
   * Generate monthly salaries for all employees
   * @param {Object} params - Generation parameters
   * @param {number} params.month - Month (1-12)
   * @param {number} params.year - Year (e.g., 2024)
   * @returns {Promise} Generation results
   */
  async generateMonthlySalaries(params) {
    console.log('Generating monthly salaries:', params)
    const response = await apiClient.post('/salaries/generate', params)
    console.log('Monthly salaries generated:', response)
    return response.data
  },

  /**
   * Update salary status (single)
   * @param {number} salaryId - Salary ID
   * @param {string} status - New status (pending, approved, paid)
   * @returns {Promise} Updated salary
   */
  async updateSalaryStatus(salaryId, status) {
    console.log(`Updating salary ${salaryId} status to:`, status)
    const response = await apiClient.put(`/salaries/${salaryId}/status`, { status })
    console.log('Salary status updated:', response)
    return response.data
  },

  /**
   * Bulk update salary status
   * @param {Object} params - Bulk update parameters
   * @param {number} params.month - Month (1-12)
   * @param {number} params.year - Year (e.g., 2024)
   * @param {string} params.status - New status (pending, approved, paid)
   * @param {number} params.employee_id - Optional: specific employee ID
   * @returns {Promise} Bulk update results
   */
  async bulkUpdateSalaryStatus(params) {
    console.log('Bulk updating salary status:', params)
    const response = await apiClient.put('/salaries/status', params)
    console.log('Bulk salary status updated:', response)
    return response.data
  },

  /**
   * Add payroll adjustment (bonus/deduction)
   * @param {Object} adjustmentData - Adjustment data
   * @param {number} adjustmentData.employee_id - Employee ID
   * @param {string} adjustmentData.type - Type (bonus, deduction)
   * @param {number} adjustmentData.amount - Amount
   * @param {string} adjustmentData.reason - Reason
   * @param {string} adjustmentData.adjustment_date - Date
   * @returns {Promise} Created adjustment
   */
  async addPayrollAdjustment(adjustmentData) {
    console.log('Adding payroll adjustment:', adjustmentData)
    const response = await apiClient.post('/payroll-adjustments', adjustmentData)
    console.log('Payroll adjustment added:', response)
    return response.data
  },

  /**
   * Get employee salaries
   * @param {Object} params - Query parameters
   * @param {number} params.employee_id - Employee ID
   * @param {number} params.month - Month filter
   * @param {number} params.year - Year filter
   * @param {string} params.status - Status filter
   * @param {number} params.per_page - Items per page
   * @param {number} params.page - Page number
   * @returns {Promise} Paginated salaries
   */
  async getSalaries(params = {}) {
    console.log('Fetching salaries with params:', params)
    const response = await apiClient.get('/salaries', { params })
    console.log('Salaries response:', response)
    return response.data
  },

  /**
   * Get specific salary by ID
   * @param {number} id - Salary ID
   * @returns {Promise} Salary details
   */
  async getSalary(id) {
    console.log(`Fetching salary ${id}`)
    const response = await apiClient.get(`/salaries/${id}`)
    console.log('Salary response:', response)
    return response.data
  },

  /**
   * Get salary statistics
   * @param {Object} params - Statistics parameters
   * @param {number} params.month - Month filter
   * @param {number} params.year - Year filter
   * @returns {Promise} Salary statistics
   */
  async getSalaryStatistics(params = {}) {
    console.log('Fetching salary statistics:', params)
    const response = await apiClient.get('/salaries/statistics', { params })
    console.log('Salary statistics response:', response)
    return response.data
  },

  /**
   * Export salaries to CSV/PDF
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (csv, pdf)
   * @param {Object} params.filters - Filters to apply
   * @returns {Promise} Export file
   */
  async exportSalaries(params = {}) {
    console.log('Exporting salaries with params:', params)
    const response = await apiClient.get('/salaries/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Salaries exported:', response)
    return response.data
  },

  /**
   * Get employees for payroll adjustments
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by employment status (active)
   * @param {number} params.per_page - Items per page
   * @returns {Promise} Employees list
   */
  async getEmployeesForAdjustments(params = {}) {
    console.log('Fetching employees for adjustments:', params)
    const response = await apiClient.get('/employees', { 
      params: { 
        employment_status: 'active',
        per_page: 100,
        ...params 
      }
    })
    console.log('Employees for adjustments fetched:', response)
    return response.data
  },

  // ==================== HELPER METHODS ====================
  
  /**
   * Get salary status options for dropdowns
   * @returns {Array} Array of status options
   */
  getSalaryStatusOptions() {
    return [
      { value: 'draft', label: 'Draft', icon: '📝', color: 'secondary' },
      { value: 'finalized', label: 'Finalized', icon: '✅', color: 'success' },
      { value: 'paid', label: 'Paid', icon: '💰', color: 'info' }
    ]
  },

  /**
   * Get adjustment type options
   * @returns {Array} Array of adjustment type options
   */
  getAdjustmentTypeOptions() {
    return [
      { value: 'bonus', label: 'Bonus', icon: '🎁', color: 'success' },
      { value: 'deduction', label: 'Deduction', icon: '❌', color: 'danger' }
    ]
  },

  /**
   * Format currency amount
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol (default: $)
   * @returns {string} Formatted amount
   */
  formatCurrency(amount, currency = '$') {
    if (amount === null || amount === undefined) return `${currency}0.00`
    return `${currency}${parseFloat(amount).toFixed(2)}`
  },

  /**
   * Get salary status display info
   * @param {string} status - Status value
   * @returns {Object} Display information
   */
  getSalaryStatusInfo(status) {
    const options = this.getSalaryStatusOptions()
    return options.find(opt => opt.value === status) || { label: status, icon: '❓', color: 'secondary' }
  },

  /**
   * Get adjustment type display info
   * @param {string} type - Adjustment type
   * @returns {Object} Display information
   */
  getAdjustmentTypeInfo(type) {
    const options = this.getAdjustmentTypeOptions()
    return options.find(opt => opt.value === type) || { label: type, icon: '❓', color: 'secondary' }
  },

  /**
   * Calculate net salary
   * @param {number} baseSalary - Base salary
   * @param {number} totalBonus - Total bonus
   * @param {number} totalDeductions - Total deductions
   * @returns {number} Net salary
   */
  calculateNetSalary(baseSalary, totalBonus = 0, totalDeductions = 0) {
    return (parseFloat(baseSalary) || 0) + (parseFloat(totalBonus) || 0) - (parseFloat(totalDeductions) || 0)
  },

  /**
   * Get month options
   * @returns {Array} Array of month options
   */
  getMonthOptions() {
    return [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' }
    ]
  },

  /**
   * Get year options (current year and previous 4 years)
   * @returns {Array} Array of year options
   */
  getYearOptions() {
    const currentYear = new Date().getFullYear()
    const years = []
    
    for (let i = 0; i < 5; i++) {
      years.push({
        value: currentYear - i,
        label: (currentYear - i).toString()
      })
    }
    
    return years
  },

  /**
   * Format month and year
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {string} Formatted month and year
   */
  formatMonthYear(month, year) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    return `${monthNames[month - 1]} ${year}`
  },

  /**
   * Get salary summary statistics
   * @param {Array} salaries - Array of salary records
   * @returns {Object} Summary statistics
   */
  getSalarySummary(salaries) {
    if (!Array.isArray(salaries) || salaries.length === 0) {
      return {
        totalSalaries: 0,
        totalBaseSalary: 0,
        totalBonus: 0,
        totalDeductions: 0,
        totalNetSalary: 0,
        averageSalary: 0,
        pendingCount: 0,
        approvedCount: 0,
        paidCount: 0
      }
    }

    const totalSalaries = salaries.length
    const totalBaseSalary = salaries.reduce((sum, s) => sum + (parseFloat(s.base_salary) || 0), 0)
    const totalBonus = salaries.reduce((sum, s) => sum + (parseFloat(s.total_bonus) || 0), 0)
    const totalDeductions = salaries.reduce((sum, s) => sum + (parseFloat(s.total_deductions) || 0), 0)
    const totalNetSalary = salaries.reduce((sum, s) => sum + (parseFloat(s.net_salary) || 0), 0)
    
    const draftCount = salaries.filter(s => s.status === 'draft').length
    const finalizedCount = salaries.filter(s => s.status === 'finalized').length
    const paidCount = salaries.filter(s => s.status === 'paid').length

    return {
      totalSalaries,
      totalBaseSalary,
      totalBonus,
      totalDeductions,
      totalNetSalary,
      averageSalary: totalNetSalary / totalSalaries,
      draftCount,
      finalizedCount,
      paidCount
    }
  }
}
