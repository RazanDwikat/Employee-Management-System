<template>
  <div class="employee-salaries">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">My Salaries</h1>
      <p class="page-subtitle">View your salary history and details</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading salary information...</p>
    </div>
    
    <!-- Salary Content -->
    <div v-else class="salary-content">
      <!-- Current Salary Card -->
      <div class="current-salary-card">
        <h3 class="card-title">Current Month Salary</h3>
        
        <div class="salary-display">
          <div class="salary-amount">
            <span class="currency-symbol">$</span>
            <span class="amount">{{ formatCurrency(currentSalary?.net_salary || 0) }}</span>
          </div>
          <div class="salary-period">
            {{ getMonthName(currentSalary?.month) }} {{ currentSalary?.year }}
          </div>
        </div>
        
        <div class="salary-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label">Base Salary:</span>
            <span class="breakdown-value">{{ formatCurrency(currentSalary?.base_salary || 0) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Total Bonus:</span>
            <span class="breakdown-value positive">+{{ formatCurrency(currentSalary?.total_bonus || 0) }}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Total Deductions:</span>
            <span class="breakdown-value negative">-{{ formatCurrency(currentSalary?.total_deductions || 0) }}</span>
          </div>
          <div class="breakdown-item total">
            <span class="breakdown-label">Net Salary:</span>
            <span class="breakdown-value">{{ formatCurrency(currentSalary?.net_salary || 0) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Salary History -->
      <div class="salary-history-card">
        <div class="history-header">
          <h3 class="history-title">Salary History</h3>
          
          <!-- Filters -->
          <div class="history-filters">
            <select v-model="filters.month" class="filter-select" @change="loadSalaries">
              <option value="">All Months</option>
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
            
            <select v-model="filters.year" class="filter-select" @change="loadSalaries">
              <option value="">All Years</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Salary List -->
        <div class="salary-list">
          <div v-if="salaries.length === 0" class="empty-state">
            <div class="empty-icon">💰</div>
            <p>No salary records found</p>
          </div>
          
          <div v-else v-for="salary in salaries" :key="salary.id" class="salary-item">
            <div class="salary-header">
              <div class="salary-period-badge">
                {{ getMonthName(salary.month) }} {{ salary.year }}
              </div>
              <div class="salary-status">
                <span class="status-badge" :class="getStatusClass(salary.status)">
                  {{ salary.status }}
                </span>
              </div>
            </div>
            
            <div class="salary-details">
              <div class="detail-row">
                <span class="detail-label">Base Salary:</span>
                <span class="detail-value amount">{{ formatCurrency(salary.base_salary) }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Net Salary:</span>
                <span class="detail-value amount net">{{ formatCurrency(salary.net_salary) }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">
                  {{ salary.payment_date ? formatDate(salary.payment_date) : 'Pending' }}
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Working Days:</span>
                <span class="detail-value">{{ salary.working_days || 0 }} days</span>
              </div>
            </div>
            
            <!-- Expandable Details -->
            <div v-if="expandedSalaryId === salary.id" class="salary-expanded">
              <div class="expanded-section">
                <h4 class="section-title">Salary Breakdown</h4>
                
                <!-- Base Salary Summary -->
                <div class="summary-section">
                  <div class="summary-item">
                    <span class="label">Base Salary:</span>
                    <span class="value">{{ formatCurrency(salary.base_salary) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Total Bonus:</span>
                    <span class="value positive">+{{ formatCurrency(salary.total_bonus || 0) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Total Deductions:</span>
                    <span class="value negative">-{{ formatCurrency(salary.total_deductions || 0) }}</span>
                  </div>
                  <div class="summary-item total">
                    <span class="label">Net Salary:</span>
                    <span class="value">{{ formatCurrency(salary.net_salary) }}</span>
                  </div>
                </div>
                
                <!-- Detailed Breakdown -->
                <div v-if="salary.salary_details && salary.salary_details.length > 0" class="details-section">
                  <h5 class="details-title">Detailed Adjustments</h5>
                  <div class="details-list">
                    <div 
                      v-for="detail in salary.salary_details" 
                      :key="detail.id || `${detail.type}-${detail.date}`"
                      class="detail-item"
                      :class="detail.type"
                    >
                      <div class="detail-info">
                        <div class="detail-type">{{ getDetailTypeLabel(detail.type) }}</div>
                        <div class="detail-reason">{{ detail.reason }}</div>
                        <div class="detail-date">{{ formatDate(detail.date) }}</div>
                      </div>
                      <div class="detail-amount" :class="getDetailTypeClass(detail.type)">
                        {{ getDetailAmount(detail) }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="no-details">
                  <p>No additional adjustments for this period</p>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="salary-actions">
              <button
                @click="toggleSalaryDetails(salary.id)"
                class="btn btn-secondary btn-sm"
              >
                {{ expandedSalaryId === salary.id ? 'Hide Details' : 'Show Details' }}
              </button>
              
              <button
                v-if="salary.payslip_url"
                @click="downloadPayslip(salary)"
                class="btn btn-primary btn-sm"
              >
                <span class="btn-icon">📄</span>
                Download Payslip
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.total > pagination.per_page" class="pagination">
          <button
            @click="loadSalaries(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          
          <span class="page-info">
            Page {{ pagination.current_page }} of {{ pagination.last_page }}
          </span>
          
          <button
            @click="loadSalaries(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      </div>
      
      <!-- Salary Statistics -->
      <div class="salary-stats-card">
        <h3 class="stats-title">Yearly Statistics</h3>
        
        <div class="stats-grid">
          <div class="stat-item total">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <p class="stat-number">{{ formatCurrency(stats.totalEarned) }}</p>
              <p class="stat-label">Total Earned</p>
            </div>
          </div>
          
          <div class="stat-item average">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <p class="stat-number">{{ formatCurrency(stats.averageSalary) }}</p>
              <p class="stat-label">Average Monthly</p>
            </div>
          </div>
          
          <div class="stat-item months">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <p class="stat-number">{{ stats.monthsPaid }}</p>
              <p class="stat-label">Months Paid</p>
            </div>
          </div>
          
          <div class="stat-item pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <p class="stat-number">{{ stats.pendingMonths }}</p>
              <p class="stat-label">Pending</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Success/Error Messages -->
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import employeeService from '../../services/employeeService'

export default {
  name: 'EmployeeSalaries',
  setup() {
    // Reactive data
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('success')
    
    const salaries = ref([])
    const currentSalary = ref(null)
    const expandedSalaryId = ref(null)
    
    const stats = ref({
      totalEarned: 0,
      averageSalary: 0,
      monthsPaid: 0,
      pendingMonths: 0
    })
    
    const pagination = ref({
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0
    })
    
    const filters = ref({
      month: '',
      year: ''
    })
    
    // Computed properties
    const months = computed(() => [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ])
    
    const availableYears = computed(() => {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - i)
    })
    
    // Methods
    const loadSalaries = async (page = 1) => {
      try {
        loading.value = true
        
        const params = {
          page,
          ...filters.value
        }
        
        const response = await employeeService.getSalaries(params)
        salaries.value = response.data || []
        
        if (response.meta) {
          pagination.value = response.meta
        }
        
        // Set current salary (first item if available)
        if (salaries.value.length > 0) {
          currentSalary.value = salaries.value[0]
        }
        
        // Calculate stats
        calculateStats()
        
      } catch (error) {
        console.error('Error loading salaries:', error)
        showMessage('Error loading salary information', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const calculateStats = () => {
      const allSalaries = salaries.value
      
      if (allSalaries.length === 0) {
        stats.value = { totalEarned: 0, averageSalary: 0, monthsPaid: 0, pendingMonths: 0 }
        return
      }
      
      const paidSalaries = allSalaries.filter(s => s.status === 'paid')
      const pendingSalaries = allSalaries.filter(s => s.status === 'pending')
      
      const totalEarned = paidSalaries.reduce((sum, s) => sum + (s.net_salary || 0), 0)
      const averageSalary = paidSalaries.length > 0 ? totalEarned / paidSalaries.length : 0
      
      stats.value = {
        totalEarned,
        averageSalary,
        monthsPaid: paidSalaries.length,
        pendingMonths: pendingSalaries.length
      }
    }
    
    const toggleSalaryDetails = (salaryId) => {
      expandedSalaryId.value = expandedSalaryId.value === salaryId ? null : salaryId
    }
    
    const downloadPayslip = async (salary) => {
      try {
        if (!salary.payslip_url) {
          showMessage('Payslip not available', 'error')
          return
        }
        
        // Create download link
        const link = document.createElement('a')
        link.href = salary.payslip_url
        link.download = `payslip-${salary.month}-${salary.year}.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        showMessage('Payslip downloaded successfully!', 'success')
        
      } catch (error) {
        console.error('Error downloading payslip:', error)
        showMessage('Error downloading payslip', 'error')
      }
    }
    
    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0)
    }
    
    const getMonthName = (month) => {
      if (!month) return ''
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      return monthNames[month - 1] || month
    }
    
    const getStatusClass = (status) => {
      const classes = {
        paid: 'text-green-600 bg-green-100',
        pending: 'text-yellow-600 bg-yellow-100',
        processing: 'text-blue-600 bg-blue-100',
        rejected: 'text-red-600 bg-red-100'
      }
      return classes[status] || 'text-gray-600 bg-gray-100'
    }
    
    const getDetailTypeLabel = (type) => {
      const labels = {
        bonus: 'Bonus',
        overtime: 'Overtime',
        allowance: 'Allowance',
        deduction: 'Deduction',
        absence: 'Absence',
        late: 'Late Arrival',
        tax: 'Tax',
        insurance: 'Insurance'
      }
      return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
    }
    
    const getDetailTypeClass = (type) => {
      const positiveTypes = ['bonus', 'overtime', 'allowance']
      const negativeTypes = ['deduction', 'absence', 'late', 'tax', 'insurance']
      
      if (positiveTypes.includes(type)) return 'positive'
      if (negativeTypes.includes(type)) return 'negative'
      return 'neutral'
    }
    
    const getDetailAmount = (detail) => {
      const amount = parseFloat(detail.amount) || 0
      const typeClass = getDetailTypeClass(detail.type)
      
      if (typeClass === 'positive') {
        return `+${formatCurrency(amount)}`
      } else if (typeClass === 'negative') {
        return `-${formatCurrency(Math.abs(amount))}`
      } else {
        return formatCurrency(amount)
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Lifecycle
    onMounted(() => {
      loadSalaries()
    })
    
    return {
      loading,
      message,
      messageType,
      salaries,
      currentSalary,
      expandedSalaryId,
      stats,
      pagination,
      filters,
      months,
      availableYears,
      loadSalaries,
      toggleSalaryDetails,
      downloadPayslip,
      formatCurrency,
      getMonthName,
      getStatusClass,
      getDetailTypeLabel,
      getDetailTypeClass,
      getDetailAmount,
      formatDate
    }
  }
}
</script>

<style scoped>
.employee-salaries {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #5f6368;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e8eaed;
  border-top: 4px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Current Salary Card */
.current-salary-card {
  background: linear-gradient(135deg, #5e847e 0%, #3d7d73 100%);
  color: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
}

.salary-display {
  text-align: center;
  margin-bottom: 32px;
}

.salary-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.currency-symbol {
  font-size: 32px;
  opacity: 0.8;
}

.amount {
  font-size: 48px;
  font-weight: 700;
}

.salary-period {
  font-size: 16px;
  opacity: 0.8;
}

.salary-breakdown {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.breakdown-item:last-child {
  margin-bottom: 0;
}

.breakdown-item.total {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.breakdown-label {
  font-size: 14px;
  opacity: 0.9;
}

.breakdown-value {
  font-size: 16px;
  font-weight: 500;
}

.breakdown-value.positive {
  color: #86efac;
}

.breakdown-value.negative {
  color: #fca5a5;
}

/* Salary History Card */
.salary-history-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.history-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.history-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e8eaed;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

/* Salary List */
.salary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.salary-item {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.salary-item:hover {
  border-color: #dadce0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.salary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.salary-period-badge {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.text-green-600 {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.text-yellow-600 {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.text-blue-600 {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.text-red-600 {
  background: #fee2e2;
  color: #991b1b;
}

.salary-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  color: #5f6368;
  min-width: 120px;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
}

.detail-value.amount {
  font-size: 16px;
  font-weight: 600;
  color: #1a73e8;
}

.detail-value.amount.net {
  color: #10b981;
}

/* Expanded Details */
.salary-expanded {
  border-top: 1px solid #e8eaed;
  padding-top: 16px;
  margin-top: 16px;
}

.expanded-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

/* Summary Section */
.summary-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item.total {
  padding-top: 8px;
  border-top: 1px solid #e8eaed;
  font-weight: 600;
}

.summary-item .label {
  font-size: 14px;
  color: #5f6368;
}

.summary-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.summary-item .value.positive {
  color: #10b981;
}

.summary-item .value.negative {
  color: #ef4444;
}

/* Details Section */
.details-section {
  margin-top: 20px;
}

.details-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  background: white;
  border: 1px solid #e8eaed;
}

.detail-item.bonus {
  border-left: 4px solid #10b981;
}

.detail-item.overtime {
  border-left: 4px solid #10b981;
}

.detail-item.allowance {
  border-left: 4px solid #10b981;
}

.detail-item.deduction {
  border-left: 4px solid #ef4444;
}

.detail-item.absence {
  border-left: 4px solid #ef4444;
}

.detail-item.late {
  border-left: 4px solid #f59e0b;
}

.detail-item.tax {
  border-left: 4px solid #ef4444;
}

.detail-item.insurance {
  border-left: 4px solid #ef4444;
}

.detail-info {
  flex: 1;
}

.detail-type {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.detail-reason {
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 2px;
}

.detail-date {
  font-size: 11px;
  color: #9ca3af;
}

.detail-amount {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.detail-amount.positive {
  background: #d1fae5;
  color: #065f46;
}

.detail-amount.negative {
  background: #fee2e2;
  color: #991b1b;
}

.detail-amount.neutral {
  background: #f3f4f6;
  color: #374151;
}

.no-details {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-style: italic;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.breakdown-item .label {
  font-size: 12px;
  color: #5f6368;
  display: block;
  margin-bottom: 4px;
}

.breakdown-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.breakdown-item .value.positive {
  color: #10b981;
}

.breakdown-item .value.negative {
  color: #ef4444;
}

/* Action Buttons */
.salary-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f3f4;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 11px;
}

.btn-primary {
  background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
}

.btn-secondary {
  background: white;
  color: #5f6368;
  border: 1px solid #e8eaed;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #dadce0;
}

.btn-icon {
  font-size: 14px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #5f6368;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Salary Statistics Card */
.salary-stats-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item.total {
  background: #e8f0fe;
}

.stat-item.average {
  background: #d1fae5;
}

.stat-item.months {
  background: #fef3c7;
}

.stat-item.pending {
  background: #fee2e2;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 12px;
  color: #5f6368;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8eaed;
}

.page-info {
  font-size: 14px;
  color: #5f6368;
}

/* Messages */
.message {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .employee-salaries {
    padding: 16px;
  }
  
  .current-salary-card,
  .salary-history-card,
  .salary-stats-card {
    padding: 20px;
  }
  
  .salary-amount {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  
  .amount {
    font-size: 36px;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .history-filters {
    width: 100%;
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
  
  .salary-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
