import apiClient from './apiClient'

export default {
 
  async getPayrollRules(params = {}) {
    console.log('Fetching payroll rules with params:', params)
    const response = await apiClient.get('/payroll-rules', { params })
    console.log('Payroll rules response:', response)
    return response.data
  },

  
  async getPayrollRule(id) {
    console.log(`Fetching payroll rule ${id}`)
    const response = await apiClient.get(`/payroll-rules/${id}`)
    console.log('Payroll rule response:', response)
    return response.data
  },

  async createPayrollRule(ruleData) {
    console.log('Creating payroll rule:', ruleData)
    const response = await apiClient.post('/payroll-rules', ruleData)
    console.log('Payroll rule created:', response)
    return response.data
  },

  
  async updatePayrollRule(id, ruleData) {
    console.log(`Updating payroll rule ${id}:`, ruleData)
    const response = await apiClient.put(`/payroll-rules/${id}`, ruleData)
    console.log('Payroll rule updated:', response)
    return response.data
  },

 
  async deletePayrollRule(id) {
    console.log(`Deleting payroll rule ${id}`)
    const response = await apiClient.delete(`/payroll-rules/${id}`)
    console.log('Payroll rule deleted:', response)
    return response.data
  },


  async getPayrollRuleStatistics() {
    console.log('Fetching payroll rule statistics')
    const response = await apiClient.get('/payroll-rules/statistics')
    console.log('Payroll rule statistics response:', response)
    return response.data
  },


  async calculatePayrollImpact(params = {}) {
    console.log('Calculating payroll impact:', params)
    const response = await apiClient.post('/payroll-rules/calculate', params)
    console.log('Payroll impact calculated:', response)
    return response.data
  },


  async exportPayrollRules(params = {}) {
    console.log('Exporting payroll rules with params:', params)
    const response = await apiClient.get('/payroll-rules/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Payroll rules exported:', response)
    return response.data
  },


  getRuleTypeOptions() {
    return [
      { value: 'late', label: 'Late Deduction', icon: '⏰', color: 'danger' },
      { value: 'overtime', label: 'Overtime Bonus', icon: '💰', color: 'success' },
      { value: 'absence', label: 'Absence Deduction', icon: '❌', color: 'danger' },
      { value: 'leave', label: 'Leave Deduction', icon: '📅', color: 'warning' }
    ]
  },

  getCalculationTypeOptions() {
    return [
      { value: 'per_minute', label: 'Per Minute', unit: 'min' },
      { value: 'per_hour', label: 'Per Hour', unit: 'hour' },
      { value: 'per_day', label: 'Per Day', unit: 'day' },
      { value: 'fixed', label: 'Fixed Amount', unit: 'fixed' }
    ]
  },


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

 
  getRuleTypeInfo(ruleType) {
    const options = this.getRuleTypeOptions()
    return options.find(opt => opt.value === ruleType) || { label: ruleType, icon: '❓', color: 'secondary' }
  },

  getCalculationTypeInfo(calculationType) {
    const options = this.getCalculationTypeOptions()
    return options.find(opt => opt.value === calculationType) || { label: calculationType, unit: '' }
  }
}
