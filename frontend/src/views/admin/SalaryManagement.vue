<template>
  <div class="salary-management">
    <h1>Salary Management</h1>
    
    <div class="actions-bar">
      <div class="search-section">
        <SearchFilter 
          v-model:searchQuery="searchQuery"
          :filters="filterConfig"
          :loading="loading"
          search-placeholder="Search salaries..."
          @filter-change="handleFilterChange"
          @clear-filters="clearFilters"
        />
      </div>
      
      <div class="action-buttons">
        <button @click="openGenerateModal" class="generate-btn" :disabled="loading">
          Generate Salaries
        </button>
        <button @click="openAdjustmentModal" class="adjustment-btn" :disabled="loading">
          Add Adjustment
        </button>
        <button @click="openBulkActionsModal" class="bulk-actions-btn" :disabled="loading">
          Bulk Actions
        </button>
      </div>
    </div>
    
    <!-- Statistics Cards -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon info">💰</div>
        <div class="stat-content">
          <div class="stat-number">{{ formatCurrency(salarySummary.totalNetSalary) }}</div>
          <div class="stat-label">Total Net Salary</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">✅</div>
        <div class="stat-content">
          <div class="stat-number">{{ salarySummary.finalizedCount }}</div>
          <div class="stat-label">Finalized</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon secondary">📝</div>
        <div class="stat-content">
          <div class="stat-number">{{ salarySummary.draftCount }}</div>
          <div class="stat-label">Draft</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon primary">💵</div>
        <div class="stat-content">
          <div class="stat-number">{{ salarySummary.paidCount }}</div>
          <div class="stat-label">Paid</div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="salaries" 
      :columns="salaryColumns" 
      :loading="loading"
      :empty-message="'No salaries found'"
    >
      <template #cell-employee="{ item }">
        <div class="employee-info">
          <div class="employee-name">{{ item.employee?.user?.name || 'N/A' }}</div>
          <div class="employee-department">{{ item.employee?.department?.name || 'N/A' }}</div>
        </div>
      </template>
      
      <template #cell-period="{ item }">
        <div class="period-info">
          <div class="month-year">{{ formatMonthYear(item.month, item.year) }}</div>
        </div>
      </template>
      
      <template #cell-base_salary="{ item }">
        <div class="salary-amount">
          {{ formatCurrency(item.base_salary) }}
        </div>
      </template>
      
      <template #cell-total_bonus="{ item }">
        <div class="bonus-amount success">
          +{{ formatCurrency(item.total_bonus) }}
        </div>
      </template>
      
      <template #cell-total_deductions="{ item }">
        <div class="deduction-amount danger">
          -{{ formatCurrency(item.total_deductions) }}
        </div>
      </template>
      
      <template #cell-net_salary="{ item }">
        <div class="net-amount primary">
          {{ formatCurrency(item.net_salary) }}
        </div>
      </template>
      
      <template #cell-status="{ item }">
        <span :class="getStatusClass(item.status)">
          {{ getSalaryStatusInfo(item.status).icon }} {{ getSalaryStatusInfo(item.status).label }}
        </span>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button @click="viewSalary(item)" class="view-btn" :disabled="loading">
            View
          </button>
          <button 
            v-if="item.status === 'draft'"
            @click="finalizeSalary(item)" 
            class="finalize-btn" 
            :disabled="loading"
          >
            Finalize
          </button>
          <button 
            v-if="item.status === 'finalized'"
            @click="markAsPaid(item)" 
            class="paid-btn" 
            :disabled="loading"
          >
            Mark Paid
          </button>
        </div>
      </template>
    </DataTable>
    
    <!-- Generate Salaries Modal -->
    <BaseModal 
      v-model="showGenerateModal"
      title="Generate Monthly Salaries"
      :loading="generateLoading"
      loading-text="Generating..."
      save-text="Generate"
      @save="generateSalaries"
      @cancel="closeGenerateModal"
    >
      <template #body>
        <form class="generate-form" @submit.prevent>
          <div class="form-group">
            <label for="month">Month</label>
            <select 
              id="month" 
              v-model="generateForm.month" 
              required
              :disabled="generateLoading"
            >
              <option value="">Select Month</option>
              <option 
                v-for="month in monthOptions" 
                :key="month.value" 
                :value="month.value"
              >
                {{ month.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="year">Year</label>
            <select 
              id="year" 
              v-model="generateForm.year" 
              required
              :disabled="generateLoading"
            >
              <option value="">Select Year</option>
              <option 
                v-for="year in yearOptions" 
                :key="year.value" 
                :value="year.value"
              >
                {{ year.label }}
              </option>
            </select>
          </div>
          
          <div class="generation-info">
            <h4>What will be generated:</h4>
            <ul>
              <li>Monthly salaries for all active employees</li>
              <li>Automatic calculation of bonuses and deductions</li>
              <li>Application of payroll rules</li>
              <li>Initial status: Pending</li>
            </ul>
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- Add Adjustment Modal -->
    <BaseModal 
      v-model="showAdjustmentModal"
      title="Add Payroll Adjustment"
      :loading="adjustmentLoading"
      loading-text="Adding..."
      save-text="Add Adjustment"
      @save="addAdjustment"
      @cancel="closeAdjustmentModal"
    >
      <template #body>
        <form class="adjustment-form" @submit.prevent>
          <div class="form-group">
            <label for="employee_id">Employee</label>
            <select 
              id="employee_id" 
              v-model="adjustmentForm.employee_id" 
              required
              :disabled="adjustmentLoading"
            >
              <option value="">Select Employee</option>
              <option 
                v-for="employee in employees" 
                :key="employee.id" 
                :value="employee.id"
              >
                {{ employee.user?.name || 'N/A' }} - {{ employee.employee_number || 'N/A' }}
              </option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="type">Adjustment Type</label>
              <select 
                id="type" 
                v-model="adjustmentForm.type" 
                required
                :disabled="adjustmentLoading"
              >
                <option value="">Select Type</option>
                <option 
                  v-for="type in adjustmentTypeOptions" 
                  :key="type.value" 
                  :value="type.value"
                >
                  {{ type.icon }} {{ type.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="amount">Amount</label>
              <div class="amount-input-group">
                <span class="currency-symbol">$</span>
                <input 
                  id="amount" 
                  v-model.number="adjustmentForm.amount" 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  :disabled="adjustmentLoading"
                />
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="reason">Reason</label>
            <input 
              id="reason" 
              v-model="adjustmentForm.reason" 
              type="text" 
              placeholder="e.g., Performance bonus, Medical deduction"
              required
              :disabled="adjustmentLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="adjustment_date">Date</label>
            <input 
              id="adjustment_date" 
              v-model="adjustmentForm.adjustment_date" 
              type="date" 
              required
              :disabled="adjustmentLoading"
            />
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- Bulk Actions Modal -->
    <BaseModal 
      v-model="showBulkActionsModal"
      title="Bulk Salary Actions"
      :loading="bulkLoading"
      loading-text="Processing..."
      save-text="Execute"
      @save="executeBulkAction"
      @cancel="closeBulkActionsModal"
    >
      <template #body>
        <form class="bulk-actions-form" @submit.prevent>
          <div class="form-group">
            <label for="bulk_action">Action Type</label>
            <select 
              id="bulk_action" 
              v-model="bulkForm.action" 
              required
              :disabled="bulkLoading"
            >
              <option value="">Select Action</option>
              <option value="finalize_all">Finalize All Draft Salaries</option>
              <option value="mark_all_paid">Mark All Finalized as Paid</option>
              <option value="mark_month_paid">Mark Specific Month as Paid</option>
            </select>
          </div>
          
          <div v-if="bulkForm.action === 'mark_month_paid'" class="form-row">
            <div class="form-group">
              <label for="bulk_month">Month</label>
              <select 
                id="bulk_month" 
                v-model="bulkForm.month" 
                required
                :disabled="bulkLoading"
              >
                <option value="">Select Month</option>
                <option 
                  v-for="month in monthOptions" 
                  :key="month.value" 
                  :value="month.value"
                >
                  {{ month.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="bulk_year">Year</label>
              <select 
                id="bulk_year" 
                v-model="bulkForm.year" 
                required
                :disabled="bulkLoading"
              >
                <option value="">Select Year</option>
                <option 
                  v-for="year in yearOptions" 
                  :key="year.value" 
                  :value="year.value"
                >
                  {{ year.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="bulk-preview">
            <h4>Preview:</h4>
            <div v-if="bulkForm.action === 'finalize_all'" class="preview-item">
              <span class="preview-icon">📝</span>
              <span>All draft salaries will be changed to "Finalized" status</span>
            </div>
            <div v-else-if="bulkForm.action === 'mark_all_paid'" class="preview-item">
              <span class="preview-icon">💰</span>
              <span>All finalized salaries will be changed to "Paid" status</span>
            </div>
            <div v-else-if="bulkForm.action === 'mark_month_paid' && bulkForm.month && bulkForm.year" class="preview-item">
              <span class="preview-icon">💰</span>
              <span>All salaries for {{ formatMonthYear(bulkForm.month, bulkForm.year) }} will be marked as "Paid"</span>
            </div>
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- View Salary Details Modal -->
    <BaseModal 
      v-model="showDetailsModal"
      :title="'Salary Details'"
      :loading="false"
      save-text=""
      @cancel="closeDetailsModal"
    >
      <template #body>
        <div class="salary-details" v-if="selectedSalary">
          <div class="detail-section">
            <h4>Employee Information</h4>
            <p><strong>Name:</strong> {{ selectedSalary.employee?.user?.name || 'N/A' }}</p>
            <p><strong>Department:</strong> {{ selectedSalary.employee?.department?.name || 'N/A' }}</p>
            <p><strong>Period:</strong> {{ formatMonthYear(selectedSalary.month, selectedSalary.year) }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Salary Breakdown</h4>
            <div class="salary-breakdown">
              <div class="breakdown-item">
                <span class="label">Base Salary:</span>
                <span class="amount">{{ formatCurrency(selectedSalary.base_salary) }}</span>
              </div>
              <div class="breakdown-item bonus">
                <span class="label">Total Bonus:</span>
                <span class="amount">+{{ formatCurrency(selectedSalary.total_bonus) }}</span>
              </div>
              <div class="breakdown-item deduction">
                <span class="label">Total Deductions:</span>
                <span class="amount">-{{ formatCurrency(selectedSalary.total_deductions) }}</span>
              </div>
              <div class="breakdown-item total">
                <span class="label">Net Salary:</span>
                <span class="amount">{{ formatCurrency(selectedSalary.net_salary) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="selectedSalary.adjustments && selectedSalary.adjustments.length > 0">
            <h4>Adjustments</h4>
            <div class="adjustments-list">
              <div 
                v-for="adjustment in selectedSalary.adjustments" 
                :key="adjustment.id"
                class="adjustment-item"
              >
                <span :class="getAdjustmentClass(adjustment.type)">
                  {{ getAdjustmentTypeInfo(adjustment.type).icon }} {{ adjustment.reason }}
                </span>
                <span :class="getAdjustmentAmountClass(adjustment.type)">
                  {{ adjustment.type === 'bonus' ? '+' : '-' }}{{ formatCurrency(adjustment.amount) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Status Information</h4>
            <p><strong>Status:</strong> 
              <span :class="getStatusClass(selectedSalary.status)">
                {{ getSalaryStatusInfo(selectedSalary.status).label }}
              </span>
            </p>
            <p><strong>Created:</strong> {{ formatDate(selectedSalary.created_at) }}</p>
            <p><strong>Updated:</strong> {{ formatDate(selectedSalary.updated_at) }}</p>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import DataTable from '../../components/common/DataTable.vue'
import BaseModal from '../../components/common/BaseModal.vue'
import SearchFilter from '../../components/common/SearchFilter.vue'
import { useSalaryStore } from '@/stores/salaryStore'

export default {
  name: 'SalaryManagement',
  components: {
    DataTable,
    BaseModal,
    SearchFilter
  },
  setup() {
    const salaryStore = useSalaryStore()
    
    // Fetch data on component mount
    onMounted(() => {
      salaryStore.initializeData()
    })
    
    return {
      // Store state as computed properties for reactivity
      salaries: computed(() => salaryStore.salaries),
      allSalaries: computed(() => salaryStore.allSalaries),
      employees: computed(() => salaryStore.employees),
      loading: computed(() => salaryStore.loading),
      error: computed(() => salaryStore.error),
      showGenerateModal: computed(() => salaryStore.showGenerateModal),
      showAdjustmentModal: computed(() => salaryStore.showAdjustmentModal),
      showDetailsModal: computed(() => salaryStore.showDetailsModal),
      showBulkActionsModal: computed(() => salaryStore.showBulkActionsModal),
      generateLoading: computed(() => salaryStore.generateLoading),
      adjustmentLoading: computed(() => salaryStore.adjustmentLoading),
      bulkLoading: computed(() => salaryStore.bulkLoading),
      selectedSalary: computed(() => salaryStore.selectedSalary),
      searchQuery: computed(() => salaryStore.searchQuery),
      filters: computed(() => salaryStore.filters),
      generateForm: computed(() => salaryStore.generateForm),
      adjustmentForm: computed(() => salaryStore.adjustmentForm),
      bulkForm: computed(() => salaryStore.bulkForm),
      
      // Store getters as computed properties
      salaryColumns: computed(() => salaryStore.salaryColumns),
      filterConfig: computed(() => salaryStore.filterConfig),
      statusOptions: computed(() => salaryStore.statusOptions),
      adjustmentTypeOptions: computed(() => salaryStore.adjustmentTypeOptions),
      monthOptions: computed(() => salaryStore.monthOptions),
      yearOptions: computed(() => salaryStore.yearOptions),
      salarySummary: computed(() => salaryStore.salarySummary),
      
      // Store actions
      fetchSalaries: salaryStore.fetchSalaries,
      fetchEmployees: salaryStore.fetchEmployees,
      applyFrontendFilters: salaryStore.applyFrontendFilters,
      handleFilterChange: salaryStore.handleFilterChange,
      clearFilters: salaryStore.clearFilters,
      generateSalaries: salaryStore.generateSalaries,
      addAdjustment: salaryStore.addAdjustment,
      openGenerateModal: salaryStore.openGenerateModal,
      openAdjustmentModal: salaryStore.openAdjustmentModal,
      openBulkActionsModal: salaryStore.openBulkActionsModal,
      updateGenerateForm: salaryStore.updateGenerateForm,
      updateAdjustmentForm: salaryStore.updateAdjustmentForm,
      updateBulkForm: salaryStore.updateBulkForm,
      finalizeSalary: (salary) => {
        if (!confirm(`Are you sure you want to finalize salary for ${salary.employee?.user?.name}?`)) {
          return
        }
        salaryStore.finalizeSalary(salary)
      },
      markAsPaid: (salary) => {
        if (!confirm(`Are you sure you want to mark salary as paid for ${salary.employee?.user?.name}?`)) {
          return
        }
        salaryStore.markAsPaid(salary)
      },
      viewSalary: salaryStore.viewSalary,
      closeGenerateModal: salaryStore.closeGenerateModal,
      closeAdjustmentModal: salaryStore.closeAdjustmentModal,
      closeDetailsModal: salaryStore.closeDetailsModal,
      closeBulkActionsModal: salaryStore.closeBulkActionsModal,
      executeBulkAction: salaryStore.executeBulkAction,
      getSalaryStatusInfo: salaryStore.getSalaryStatusInfo,
      getAdjustmentTypeInfo: salaryStore.getAdjustmentTypeInfo,
      formatCurrency: salaryStore.formatCurrency,
      formatMonthYear: salaryStore.formatMonthYear,
      formatDate: salaryStore.formatDate,
      getStatusClass: salaryStore.getStatusClass,
      getAdjustmentClass: salaryStore.getAdjustmentClass,
      getAdjustmentAmountClass: salaryStore.getAdjustmentAmountClass
    }
  }
}
</script>

<style scoped>
.salary-management {
  padding: 20px;
  background: transparent;
  min-height: 100vh;
}

h1 {
  margin-bottom: 20px;
  color: #6c757d;
  font-weight: 300;
  font-size: 2rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.generate-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.generate-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.adjustment-btn {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.adjustment-btn:hover:not(:disabled) {
  background: #ffeaa7;
  transform: translateY(-1px);
}

.bulk-actions-btn {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.bulk-actions-btn:hover:not(:disabled) {
  background: #d6d8db;
  transform: translateY(-1px);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #f1f3f4;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.info {
  background: #d1ecf1;
  color: #0c5460;
}

.stat-icon.success {
  background: #d4edda;
  color: #155724;
}

.stat-icon.warning {
  background: #fff3cd;
  color: #856404;
}

.stat-icon.primary {
  background: #cce5ff;
  color: #004085;
}

.stat-icon.secondary {
  background: #e2e3e5;
  color: #383d41;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #6c757d;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  margin-top: 4px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: #6c757d;
}

.employee-department {
  font-size: 12px;
  color: #999;
}

.period-info {
  font-weight: 600;
  color: #6c757d;
}

.salary-amount,
.bonus-amount,
.deduction-amount,
.net-amount {
  font-weight: 600;
  font-size: 14px;
}

.bonus-amount.success {
  color: #155724;
}

.deduction-amount.danger {
  color: #721c24;
}

.net-amount.primary {
  color: #004085;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-badge.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-badge.secondary {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.view-btn {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn:hover:not(:disabled) {
  background: #d6d8db;
  transform: translateY(-1px);
}

.finalize-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.finalize-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.paid-btn {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.paid-btn:hover:not(:disabled) {
  background: #bee5eb;
  transform: translateY(-1px);
}

.generate-form,
.adjustment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.amount-input-group {
  display: flex;
  align-items: center;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  overflow: hidden;
}

.currency-symbol {
  padding: 12px 15px;
  background: #f8f9fa;
  color: #6c757d;
  font-weight: 500;
}

.amount-input-group input {
  flex: 1;
  border: none;
  padding: 12px 15px;
}

.generation-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.generation-info h4 {
  margin-bottom: 10px;
  color: #6c757d;
  font-size: 14px;
}

.generation-info ul {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
}

.generation-info li {
  margin-bottom: 5px;
}

.salary-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #6c757d;
}

.detail-section p {
  margin-bottom: 5px;
  color: #6c757d;
}

.salary-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.breakdown-item.bonus {
  border-left: 4px solid #28a745;
}

.breakdown-item.deduction {
  border-left: 4px solid #dc3545;
}

.breakdown-item.total {
  border-left: 4px solid #007bff;
  font-weight: bold;
}

.adjustments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.adjustment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.adjustment-type.success {
  color: #155724;
}

.adjustment-type.danger {
  color: #721c24;
}

.adjustment-amount.bonus {
  color: #155724;
}

.adjustment-amount.deduction {
  color: #721c24;
}

.bulk-actions-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bulk-preview {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.bulk-preview h4 {
  margin-bottom: 10px;
  color: #6c757d;
  font-size: 14px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-size: 14px;
  color: #6c757d;
}

.preview-icon {
  font-size: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    min-width: 100%;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
