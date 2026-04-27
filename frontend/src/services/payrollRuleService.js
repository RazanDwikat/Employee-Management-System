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
  // ==================== PAYROLL RULES MANAGEMENT ====================
  
  /**
   * Get all payroll rules with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.per_page - Items per page (default: 5)
   * @param {number} params.page - Page number (default: 1)
   * @param {string} params.search - Search term
   * @param {string} params.rule_type - Filter by rule type
   * @returns {Promise} Paginated payroll rules
   */
  async getPayrollRules(params = {}) {
    console.log('Fetching payroll rules with params:', params)
    const response = await apiClient.get('/payroll-rules', { params })
    console.log('Payroll rules response:', response)
    return response.data
  },

  /**
   * Get specific payroll rule by ID
   * @param {number} id - Payroll rule ID
   * @returns {Promise} Payroll rule details
   */
  async getPayrollRule(id) {
    console.log(`Fetching payroll rule ${id}`)
    const response = await apiClient.get(`/payroll-rules/${id}`)
    console.log('Payroll rule response:', response)
    return response.data
  },

  /**
   * Create new payroll rule
   * @param {Object} ruleData - Payroll rule data
   * @param {string} ruleData.rule_name - Rule name (required, unique)
   * @param {string} ruleData.rule_type - Rule type (late, overtime, absence, leave)
   * @param {string} ruleData.calculation_type - Calculation type (per_minute, per_hour, fixed, per_day)
   * @param {number} ruleData.amount - Amount (required, numeric, min: 0)
   * @returns {Promise} Created payroll rule
   */
  async createPayrollRule(ruleData) {
    console.log('Creating payroll rule:', ruleData)
    const response = await apiClient.post('/payroll-rules', ruleData)
    console.log('Payroll rule created:', response)
    return response.data
  },

  /**
   * Update existing payroll rule
   * @param {number} id - Payroll rule ID
   * @param {Object} ruleData - Updated payroll rule data
   * @returns {Promise} Updated payroll rule
   */
  async updatePayrollRule(id, ruleData) {
    console.log(`Updating payroll rule ${id}:`, ruleData)
    const response = await apiClient.put(`/payroll-rules/${id}`, ruleData)
    console.log('Payroll rule updated:', response)
    return response.data
  },

  /**
   * Delete payroll rule
   * @param {number} id - Payroll rule ID
   * @returns {Promise} Deletion confirmation
   */
  async deletePayrollRule(id) {
    console.log(`Deleting payroll rule ${id}`)
    const response = await apiClient.delete(`/payroll-rules/${id}`)
    console.log('Payroll rule deleted:', response)
    return response.data
  },

  /**
   * Get payroll rule statistics
   * @returns {Promise} Rule statistics
   */
  async getPayrollRuleStatistics() {
    console.log('Fetching payroll rule statistics')
    const response = await apiClient.get('/payroll-rules/statistics')
    console.log('Payroll rule statistics response:', response)
    return response.data
  },

  /**
   * Calculate payroll impact
   * @param {Object} params - Calculation parameters
   * @param {Array} params.rules - Array of rule IDs
   * @param {Object} params.employee_data - Employee data for calculation
   * @returns {Promise} Calculation results
   */
  async calculatePayrollImpact(params = {}) {
    console.log('Calculating payroll impact:', params)
    const response = await apiClient.post('/payroll-rules/calculate', params)
    console.log('Payroll impact calculated:', response)
    return response.data
  },

  /**
   * Export payroll rules to CSV/PDF
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (csv, pdf)
   * @param {Object} params.filters - Filters to apply
   * @returns {Promise} Export file
   */
  async exportPayrollRules(params = {}) {
    console.log('Exporting payroll rules with params:', params)
    const response = await apiClient.get('/payroll-rules/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Payroll rules exported:', response)
    return response.data
  },

  // ==================== HELPER METHODS ====================
  
  /**
   * Get rule type options for dropdowns
   * @returns {Array} Array of rule type options
   */
  getRuleTypeOptions() {
    return [
      { value: 'late', label: 'Late Deduction', icon: '⏰', color: 'danger' },
      { value: 'overtime', label: 'Overtime Bonus', icon: '💰', color: 'success' },
      { value: 'absence', label: 'Absence Deduction', icon: '❌', color: 'danger' },
      { value: 'leave', label: 'Leave Deduction', icon: '📅', color: 'warning' }
    ]
  },

  /**
   * Get calculation type options for dropdowns
   * @returns {Array} Array of calculation type options
   */
  getCalculationTypeOptions() {
    return [
      { value: 'per_minute', label: 'Per Minute', unit: 'min' },
      { value: 'per_hour', label: 'Per Hour', unit: 'hour' },
      { value: 'per_day', label: 'Per Day', unit: 'day' },
      { value: 'fixed', label: 'Fixed Amount', unit: 'fixed' }
    ]
  },

  /**
   * Format amount based on calculation type
   * @param {number} amount - The amount
   * @param {string} calculationType - Calculation type
   * @returns {string} Formatted amount
   */
  formatAmount(amount, calculationType) {
    if (calculationType === 'fixed') {
      return `$${parseFloat(amount).toFixed(2)}`
    } else if (calculationType === 'per_minute') {
      return `$${parseFloat(amount).toFixed(2)}/min`
    } else if (calculationType === 'per_hour') {
      return `$${parseFloat(amount).toFixed(2)}/hour`
    } else if (calculationType === 'per_day') {
      return `$${parseFloat(amount).toFixed(2)}/day`
    }
    return `$${parseFloat(amount).toFixed(2)}`
  },

  /**
   * Get rule type display info
   * @param {string} ruleType - Rule type
   * @returns {Object} Display information
   */
  getRuleTypeInfo(ruleType) {
    const options = this.getRuleTypeOptions()
    return options.find(opt => opt.value === ruleType) || { label: ruleType, icon: '❓', color: 'secondary' }
  },

  /**
   * Get calculation type display info
   * @param {string} calculationType - Calculation type
   * @returns {Object} Display information
   */
  getCalculationTypeInfo(calculationType) {
    const options = this.getCalculationTypeOptions()
    return options.find(opt => opt.value === calculationType) || { label: calculationType, unit: '' }
  }
}
