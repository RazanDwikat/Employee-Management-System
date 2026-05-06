import { defineStore } from 'pinia'
import salaryService from '@/services/salaryService'

export const useSalaryStore = defineStore('salary', {
  state: () => ({
    // Data
    salaries: [],
    allSalaries: [],
    employees: [],
    selectedSalary: null,
    
    // Loading states
    loading: false,
    generateLoading: false,
    adjustmentLoading: false,
    bulkLoading: false,
    
    // Error state
    error: '',
    
    // Modal states
    showGenerateModal: false,
    showAdjustmentModal: false,
    showDetailsModal: false,
    showBulkActionsModal: false,
    
    // Search and filters
    searchQuery: '',
    filters: {
      status: '',
      month: '',
      year: ''
    },
    
    // Form data
    generateForm: {
      month: '',
      year: ''
    },
    
    adjustmentForm: {
      employee_id: '',
      type: '',
      amount: '',
      reason: '',
      adjustment_date: ''
    },
    
    bulkForm: {
      action: '',
      month: '',
      year: ''
    },
    
    // Options from service
    statusOptions: salaryService.getSalaryStatusOptions(),
    adjustmentTypeOptions: salaryService.getAdjustmentTypeOptions(),
    monthOptions: salaryService.getMonthOptions(),
    yearOptions: salaryService.getYearOptions()
  }),

  getters: {
    // Columns definition
    salaryColumns() {
      return [
        { key: 'employee', label: 'Employee' },
        { key: 'period', label: 'Period' },
        { key: 'base_salary', label: 'Base Salary' },
        { key: 'total_bonus', label: 'Bonus' },
        { key: 'total_deductions', label: 'Deductions' },
        { key: 'net_salary', label: 'Net Salary' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' }
      ]
    },
    
    // Filter configuration
    filterConfig() {
      return [
        {
          key: 'status',
          placeholder: 'All Status',
          options: this.statusOptions
        },
        {
          key: 'month',
          placeholder: 'All Months',
          options: this.monthOptions
        },
        {
          key: 'year',
          placeholder: 'All Years',
          options: this.yearOptions
        }
      ]
    },
    
    // Salary summary
    salarySummary() {
      return salaryService.getSalarySummary(this.allSalaries)
    }
  },

  actions: {
    // Fetch salaries
    async fetchSalaries(params = {}) {
      this.loading = true
      this.error = ''
      
      try {
        console.log('Fetching salaries...')
        const response = await salaryService.getSalaries({ per_page: 50, ...params })
        console.log('Salaries fetched:', response)
        
        // Extract data from response (it's nested in response.data.data)
        const data = response.data?.data || response.data || response
        
        // Ensure data is an array
        this.allSalaries = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        
        console.log('Processed data:', this.allSalaries)
        
        // Apply frontend filtering
        this.applyFrontendFilters()
        
        console.log('Salaries assigned:', this.allSalaries)
      } catch (err) {
        console.error('Error fetching salaries:', err)
        this.error = err.response?.data?.message || 'Failed to fetch salaries. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    // Apply frontend filtering
    applyFrontendFilters() {
      if (!Array.isArray(this.allSalaries)) {
        this.salaries = []
        return
      }
      
      let filteredSalaries = [...this.allSalaries]
      
      // Apply search filter
      if (this.searchQuery.trim()) {
        filteredSalaries = filteredSalaries.filter(salary => 
          (salary.employee?.user?.name?.toLowerCase().includes(this.searchQuery.toLowerCase().trim()) ||
           salary.employee?.department?.name?.toLowerCase().includes(this.searchQuery.toLowerCase().trim()))
        )
      }
      
      // Apply status filter
      if (this.filters.status) {
        filteredSalaries = filteredSalaries.filter(salary => 
          salary.status === this.filters.status
        )
      }
      
      // Apply month filter
      if (this.filters.month) {
        filteredSalaries = filteredSalaries.filter(salary => 
          salary.month === parseInt(this.filters.month)
        )
      }
      
      // Apply year filter
      if (this.filters.year) {
        filteredSalaries = filteredSalaries.filter(salary => 
          salary.year === parseInt(this.filters.year)
        )
      }
      
      this.salaries = filteredSalaries
    },
    
    // Update filters
    handleFilterChange(filterData) {
      this.searchQuery = filterData.search
      this.filters = filterData.filters
      this.applyFrontendFilters()
    },
    
    // Clear filters
    clearFilters() {
      this.searchQuery = ''
      this.filters = {
        status: '',
        month: '',
        year: ''
      }
      this.applyFrontendFilters()
    },
    
    // Generate salaries
    async generateSalaries() {
      this.generateLoading = true
      this.error = ''
      
      try {
        console.log('Generating salaries:', this.generateForm)
        const response = await salaryService.generateMonthlySalaries(this.generateForm)
        console.log('Salaries generated successfully:', response)
        
        await this.fetchSalaries()
        this.closeGenerateModal()
      } catch (err) {
        console.error('Error generating salaries:', err)
        this.error = err.response?.data?.message || 'Failed to generate salaries. Please try again.'
      } finally {
        this.generateLoading = false
      }
    },
    
    // Add adjustment
    async addAdjustment() {
      this.adjustmentLoading = true
      this.error = ''
      
      try {
        console.log('Adding adjustment:', this.adjustmentForm)
        const response = await salaryService.addPayrollAdjustment(this.adjustmentForm)
        console.log('Adjustment added successfully:', response)
        
        await this.fetchSalaries()
        this.closeAdjustmentModal()
      } catch (err) {
        console.error('Error adding adjustment:', err)
        this.error = err.response?.data?.message || 'Failed to add adjustment. Please try again.'
      } finally {
        this.adjustmentLoading = false
      }
    },
    
    // Finalize salary
    async finalizeSalary(salary) {
      this.loading = true
      this.error = ''
      
      try {
        console.log(`Finalizing salary ${salary.id}`)
        await salaryService.updateSalaryStatus(salary.id, 'finalized')
        console.log('Salary finalized successfully')
        await this.fetchSalaries()
      } catch (err) {
        console.error('Error finalizing salary:', err)
        this.error = err.response?.data?.message || 'Failed to finalize salary. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    // Mark as paid
    async markAsPaid(salary) {
      this.loading = true
      this.error = ''
      
      try {
        console.log(`Marking salary ${salary.id} as paid`)
        await salaryService.updateSalaryStatus(salary.id, 'paid')
        console.log('Salary marked as paid successfully')
        await this.fetchSalaries()
      } catch (err) {
        console.error('Error marking salary as paid:', err)
        this.error = err.response?.data?.message || 'Failed to mark salary as paid. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    // View salary details
    async viewSalary(salary) {
      try {
        console.log('Fetching salary details for ID:', salary.id)
        const response = await salaryService.getSalary(salary.id)
        console.log('Salary details fetched:', response)
        this.selectedSalary = response.data || response
        this.showDetailsModal = true
      } catch (err) {
        console.error('Error fetching salary details:', err)
        // Fallback to table data if API fails
        this.selectedSalary = salary
        this.showDetailsModal = true
      }
    },
    
    // Execute bulk action
    async executeBulkAction() {
      this.bulkLoading = true
      this.error = ''
      
      try {
        console.log('Executing bulk action:', this.bulkForm)
        
        let params = {}
        
        if (this.bulkForm.action === 'finalize_all') {
          params = {
            status: 'draft'
          }
          console.log('Finalizing all draft salaries')
          const response = await salaryService.bulkUpdateSalaryStatus({
            ...params,
            status: 'finalized'
          })
          console.log('Draft salaries finalized:', response)
        } else if (this.bulkForm.action === 'mark_all_paid') {
          params = {
            status: 'finalized'
          }
          console.log('Marking all finalized salaries as paid')
          const response = await salaryService.bulkUpdateSalaryStatus({
            ...params,
            status: 'paid'
          })
          console.log('Finalized salaries marked as paid:', response)
        } else if (this.bulkForm.action === 'mark_month_paid') {
          params = {
            month: this.bulkForm.month,
            year: this.bulkForm.year,
            status: 'finalized'
          }
          console.log(`Marking ${this.formatMonthYear(this.bulkForm.month, this.bulkForm.year)} salaries as paid`)
          const response = await salaryService.bulkUpdateSalaryStatus({
            ...params,
            status: 'paid'
          })
          console.log('Month salaries marked as paid:', response)
        }
        
        await this.fetchSalaries()
        this.closeBulkActionsModal()
      } catch (err) {
        console.error('Error executing bulk action:', err)
        this.error = err.response?.data?.message || 'Failed to execute bulk action. Please try again.'
      } finally {
        this.bulkLoading = false
      }
    },
    
    // Fetch employees for adjustments
    async fetchEmployees() {
      try {
        console.log('Fetching employees for adjustments...')
        const response = await salaryService.getEmployeesForAdjustments()
        console.log('Employees fetched:', response)
        
        const data = response.data || response
        
        // Ensure data is an array
        this.employees = Array.isArray(data) ? data : (data.data || [])
        
        console.log('Processed employees:', this.employees)
      } catch (err) {
        console.error('Error fetching employees:', err)
        this.employees = []
      }
    },
    
    // Modal management
    openGenerateModal() {
      this.showGenerateModal = true
    },
    
    closeGenerateModal() {
      this.showGenerateModal = false
      this.generateForm = {
        month: '',
        year: ''
      }
    },
    
    openAdjustmentModal() {
      this.showAdjustmentModal = true
    },
    
    closeAdjustmentModal() {
      this.showAdjustmentModal = false
      this.adjustmentForm = {
        employee_id: '',
        type: '',
        amount: '',
        reason: '',
        adjustment_date: ''
      }
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedSalary = null
    },
    
    openBulkActionsModal() {
      this.showBulkActionsModal = true
    },
    
    closeBulkActionsModal() {
      this.showBulkActionsModal = false
      this.bulkForm = {
        action: '',
        month: '',
        year: ''
      }
    },
    
    // Form update methods
    updateGenerateForm(field, value) {
      this.generateForm[field] = value
    },
    
    updateAdjustmentForm(field, value) {
      this.adjustmentForm[field] = value
    },
    
    updateBulkForm(field, value) {
      this.bulkForm[field] = value
    },
    
    // Helper methods
    getSalaryStatusInfo(status) {
      return salaryService.getSalaryStatusInfo(status)
    },
    
    getAdjustmentTypeInfo(type) {
      return salaryService.getAdjustmentTypeInfo(type)
    },
    
    formatCurrency(amount) {
      return salaryService.formatCurrency(amount)
    },
    
    formatMonthYear(month, year) {
      return salaryService.formatMonthYear(month, year)
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    
    getStatusClass(status) {
      const info = this.getSalaryStatusInfo(status)
      return `status-badge ${info.color}`
    },
    
    getAdjustmentClass(type) {
      const info = this.getAdjustmentTypeInfo(type)
      return `adjustment-type ${info.color}`
    },
    
    getAdjustmentAmountClass(type) {
      return `adjustment-amount ${type}`
    },
    
    // Initialize data
    async initializeData() {
      await Promise.all([
        this.fetchSalaries(),
        this.fetchEmployees()
      ])
    }
  }
})
