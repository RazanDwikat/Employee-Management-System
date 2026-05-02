import apiClient from './apiClient'

export default {

  async setEmployeeSalary(salaryData) {
    console.log('Setting employee salary:', salaryData)
    const response = await apiClient.post('/salaries', salaryData)
    console.log('Employee salary set:', response)
    return response.data
  },

  async updateEmployeeSalary(employeeId, salaryData) {
    console.log(`Updating salary for employee ${employeeId}:`, salaryData)
    const response = await apiClient.post(`/employees/${employeeId}/salary`, salaryData)
    console.log('Employee salary updated:', response)
    return response.data
  },

  async generateMonthlySalaries(params) {
    console.log('Generating monthly salaries:', params)
    const response = await apiClient.post('/salaries/generate', params)
    console.log('Monthly salaries generated:', response)
    return response.data
  },

  async updateSalaryStatus(salaryId, status) {
    console.log(`Updating salary ${salaryId} status to:`, status)
    const response = await apiClient.put(`/salaries/${salaryId}/status`, { status })
    console.log('Salary status updated:', response)
    return response.data
  },

  async bulkUpdateSalaryStatus(params) {
    console.log('Bulk updating salary status:', params)
    const response = await apiClient.put('/salaries/status', params)
    console.log('Bulk salary status updated:', response)
    return response.data
  },

  async addPayrollAdjustment(adjustmentData) {
    console.log('Adding payroll adjustment:', adjustmentData)
    const response = await apiClient.post('/payroll-adjustments', adjustmentData)
    console.log('Payroll adjustment added:', response)
    return response.data
  },

  async getSalaries(params = {}) {
    console.log('Fetching salaries with params:', params)
    const response = await apiClient.get('/salaries', { params })
    console.log('Salaries response:', response)
    return response.data
  },

  async getSalary(id) {
    console.log(`Fetching salary ${id}`)
    const response = await apiClient.get(`/salaries/${id}`)
    console.log('Salary response:', response)
    return response.data
  },

  
  async getSalaryStatistics(params = {}) {
    console.log('Fetching salary statistics:', params)
    const response = await apiClient.get('/salaries/statistics', { params })
    console.log('Salary statistics response:', response)
    return response.data
  },

  async exportSalaries(params = {}) {
    console.log('Exporting salaries with params:', params)
    const response = await apiClient.get('/salaries/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Salaries exported:', response)
    return response.data
  },

 
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


  getSalaryStatusOptions() {
    return [
      { value: 'draft', label: 'Draft', icon: '📝', color: 'secondary' },
      { value: 'finalized', label: 'Finalized', icon: '✅', color: 'success' },
      { value: 'paid', label: 'Paid', icon: '💰', color: 'info' }
    ]
  },

  getAdjustmentTypeOptions() {
    return [
      { value: 'bonus', label: 'Bonus', icon: '🎁', color: 'success' },
      { value: 'deduction', label: 'Deduction', icon: '❌', color: 'danger' }
    ]
  },

  formatCurrency(amount, currency = '$') {
    if (amount === null || amount === undefined) return `${currency}0.00`
    return `${currency}${parseFloat(amount).toFixed(2)}`
  },

  getSalaryStatusInfo(status) {
    const options = this.getSalaryStatusOptions()
    return options.find(opt => opt.value === status) || { label: status, icon: '❓', color: 'secondary' }
  },

  getAdjustmentTypeInfo(type) {
    const options = this.getAdjustmentTypeOptions()
    return options.find(opt => opt.value === type) || { label: type, icon: '❓', color: 'secondary' }
  },

  calculateNetSalary(baseSalary, totalBonus = 0, totalDeductions = 0) {
    return (parseFloat(baseSalary) || 0) + (parseFloat(totalBonus) || 0) - (parseFloat(totalDeductions) || 0)
  },

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

  formatMonthYear(month, year) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    return `${monthNames[month - 1]} ${year}`
  },


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
