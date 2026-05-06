<template>
  <div class="payroll-rule-management">
    <h1>Payroll Rule Management</h1>
    
    <div class="actions-bar">
      <div class="search-section">
        <SearchFilter 
          v-model:searchQuery="searchQuery"
          :filters="filterConfig"
          :loading="loading"
          search-placeholder="Search payroll rules..."
          @filter-change="handleFilterChange"
          @clear-filters="clearFilters"
        />
      </div>
      
      <button @click="showAddModal = true" class="add-btn" :disabled="loading">
        Add New Rule
      </button>
    </div>
    
    <!-- Statistics Cards -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon danger">⏰</div>
        <div class="stat-content">
          <div class="stat-number">{{ lateRulesCount }}</div>
          <div class="stat-label">Late Deductions</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">💰</div>
        <div class="stat-content">
          <div class="stat-number">{{ overtimeRulesCount }}</div>
          <div class="stat-label">Overtime Bonuses</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon danger">❌</div>
        <div class="stat-content">
          <div class="stat-number">{{ absenceRulesCount }}</div>
          <div class="stat-label">Absence Deductions</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">📅</div>
        <div class="stat-content">
          <div class="stat-number">{{ leaveRulesCount }}</div>
          <div class="stat-label">Leave Rules</div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="payrollRules" 
      :columns="ruleColumns" 
      :loading="loading"
      :empty-message="'No payroll rules found'"
    >
      <template #cell-rule_name="{ item }">
        <div class="rule-name">
          <span class="rule-icon">{{ getRuleTypeInfo(item.rule_type).icon }}</span>
          <span class="name-text">{{ item.rule_name }}</span>
        </div>
      </template>
      
      <template #cell-rule_type="{ item }">
        <span :class="getRuleTypeBadgeClass(item.rule_type)">
          {{ getRuleTypeInfo(item.rule_type).label }}
        </span>
      </template>
      
      <template #cell-calculation_type="{ item }">
        <div class="calculation-info">
          <div class="calc-type">{{ getCalculationTypeInfo(item.calculation_type).label }}</div>
          <div class="calc-unit">{{ getCalculationTypeInfo(item.calculation_type).unit }}</div>
        </div>
      </template>
      
      <template #cell-amount="{ item }">
        <div class="amount-info">
          <span class="amount-value" :class="getAmountClass(item.rule_type)">
            {{ formatAmount(item.amount, item.calculation_type) }}
          </span>
        </div>
      </template>
      
      <template #cell-impact="{ item }">
        <div class="impact-preview">
          <button @click="previewImpact(item)" class="preview-btn" :disabled="loading">
            Preview Impact
          </button>
        </div>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button @click="editRule(item)" class="edit-btn" :disabled="loading">
            Edit
          </button>
          <button @click="viewRule(item)" class="view-btn" :disabled="loading">
            View
          </button>
          <button @click="deleteRule(item)" class="delete-btn" :disabled="loading">
            Delete
          </button>
        </div>
      </template>
    </DataTable>
    
    <!-- Add/Edit Modal -->
    <BaseModal 
      v-model="showAddModal"
      :title="editingRule ? 'Edit Payroll Rule' : 'Add New Payroll Rule'"
      :loading="loading"
      loading-text="Saving..."
      save-text="Save"
      @save="saveRule"
      @cancel="closeModal"
    >
      <template #body>
        <form class="rule-form" @submit.prevent>
          <div class="form-group">
            <label for="rule_name">Rule Name</label>
            <input 
              id="rule_name" 
              v-model="ruleForm.rule_name" 
              type="text" 
              placeholder="e.g., Late Deduction, Overtime Bonus"
              required
              :disabled="loading"
            />
            <div v-if="validationErrors.rule_name" class="error-text">
              {{ validationErrors.rule_name[0] }}
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="rule_type">Rule Type</label>
              <select 
                id="rule_type" 
                v-model="ruleForm.rule_type" 
                required
                :disabled="loading"
                @change="onRuleTypeChange"
              >
                <option value="">Select Rule Type</option>
                <option 
                  v-for="option in ruleTypeOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.icon }} {{ option.label }}
                </option>
              </select>
              <div v-if="validationErrors.rule_type" class="error-text">
                {{ validationErrors.rule_type[0] }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="calculation_type">Calculation Type</label>
              <select 
                id="calculation_type" 
                v-model="ruleForm.calculation_type" 
                required
                :disabled="loading"
              >
                <option value="">Select Calculation Type</option>
                <option 
                  v-for="option in calculationTypeOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <div v-if="validationErrors.calculation_type" class="error-text">
                {{ validationErrors.calculation_type[0] }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="amount">Amount</label>
            <div class="amount-input-group">
              <span class="currency-symbol">$</span>
              <input 
                id="amount" 
                v-model.number="ruleForm.amount" 
                type="number" 
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                :disabled="loading"
              />
              <span class="unit-hint">{{ getCalculationTypeInfo(ruleForm.calculation_type).unit }}</span>
            </div>
            <div v-if="validationErrors.amount" class="error-text">
              {{ validationErrors.amount[0] }}
            </div>
          </div>
          
          <div v-if="ruleForm.rule_type && ruleForm.calculation_type && ruleForm.amount" class="rule-preview">
            <h4>Rule Preview</h4>
            <div class="preview-content">
              <span class="preview-icon">{{ getRuleTypeInfo(ruleForm.rule_type).icon }}</span>
              <span class="preview-text">
                {{ ruleForm.rule_name }}: {{ formatAmount(ruleForm.amount, ruleForm.calculation_type) }}
              </span>
            </div>
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- View Details Modal -->
    <BaseModal 
      v-model="showDetailsModal"
      :title="'Payroll Rule Details'"
      :loading="false"
      save-text=""
      @cancel="closeDetailsModal"
    >
      <template #body>
        <div class="rule-details" v-if="selectedRule">
          <div class="detail-section">
            <h4>Rule Information</h4>
            <p><strong>Name:</strong> {{ selectedRule.rule_name }}</p>
            <p><strong>Type:</strong> 
              <span :class="getRuleTypeBadgeClass(selectedRule.rule_type)">
                {{ getRuleTypeInfo(selectedRule.rule_type).label }}
              </span>
            </p>
            <p><strong>Calculation:</strong> {{ getCalculationTypeInfo(selectedRule.calculation_type).label }}</p>
            <p><strong>Amount:</strong> 
              <span :class="getAmountClass(selectedRule.rule_type)">
                {{ formatAmount(selectedRule.amount, selectedRule.calculation_type) }}
              </span>
            </p>
          </div>
          
          <div class="detail-section">
            <h4>Impact Example</h4>
            <div class="impact-example">
              <div v-if="selectedRule.rule_type === 'late'">
                <p><strong>Late by 10 minutes:</strong> Deduct ${{ (selectedRule.amount * 10).toFixed(2) }}</p>
                <p><strong>Late by 1 hour:</strong> Deduct ${{ (selectedRule.amount * 60).toFixed(2) }}</p>
              </div>
              <div v-else-if="selectedRule.rule_type === 'overtime'">
                <p><strong>1 hour overtime:</strong> Add ${{ (selectedRule.amount * 60).toFixed(2) }}</p>
                <p><strong>8 hours overtime:</strong> Add ${{ (selectedRule.amount * 480).toFixed(2) }}</p>
              </div>
              <div v-else-if="selectedRule.calculation_type === 'fixed'">
                <p><strong>Per occurrence:</strong> {{ selectedRule.amount > 0 ? 'Add' : 'Deduct' }} ${{ Math.abs(selectedRule.amount).toFixed(2) }}</p>
              </div>
              <div v-else>
                <p><strong>Per day:</strong> {{ selectedRule.amount > 0 ? 'Add' : 'Deduct' }} ${{ Math.abs(selectedRule.amount).toFixed(2) }}</p>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Created Information</h4>
            <p><strong>Created:</strong> {{ formatDate(selectedRule.created_at) }}</p>
            <p><strong>Rule ID:</strong> #{{ selectedRule.id }}</p>
          </div>
        </div>
      </template>
    </BaseModal>
    
    <!-- Impact Preview Modal -->
    <BaseModal 
      v-model="showImpactModal"
      :title="'Payroll Impact Preview'"
      :loading="impactLoading"
      save-text=""
      @cancel="closeImpactModal"
    >
      <template #body>
        <div class="impact-preview-modal">
          <div v-if="impactRule" class="impact-calculation">
            <h4>{{ impactRule.rule_name }}</h4>
            <div class="calculation-scenarios">
              <div v-if="impactRule.rule_type === 'late'" class="scenario">
                <h5>Late Scenarios:</h5>
                <div class="scenario-item">
                  <span class="scenario-label">5 minutes late:</span>
                  <span class="scenario-amount danger">-${{ (impactRule.amount * 5).toFixed(2) }}</span>
                </div>
                <div class="scenario-item">
                  <span class="scenario-label">15 minutes late:</span>
                  <span class="scenario-amount danger">-${{ (impactRule.amount * 15).toFixed(2) }}</span>
                </div>
                <div class="scenario-item">
                  <span class="scenario-label">30 minutes late:</span>
                  <span class="scenario-amount danger">-${{ (impactRule.amount * 30).toFixed(2) }}</span>
                </div>
              </div>
              
              <div v-else-if="impactRule.rule_type === 'overtime'" class="scenario">
                <h5>Overtime Scenarios:</h5>
                <div class="scenario-item">
                  <span class="scenario-label">1 hour overtime:</span>
                  <span class="scenario-amount success">+${{ (impactRule.amount * 60).toFixed(2) }}</span>
                </div>
                <div class="scenario-item">
                  <span class="scenario-label">2 hours overtime:</span>
                  <span class="scenario-amount success">+${{ (impactRule.amount * 120).toFixed(2) }}</span>
                </div>
                <div class="scenario-item">
                  <span class="scenario-label">4 hours overtime:</span>
                  <span class="scenario-amount success">+${{ (impactRule.amount * 240).toFixed(2) }}</span>
                </div>
              </div>
              
              <div v-else class="scenario">
                <h5>Fixed/Per Day Scenarios:</h5>
                <div class="scenario-item">
                  <span class="scenario-label">Per occurrence:</span>
                  <span :class="['scenario-amount', impactRule.amount > 0 ? 'success' : 'danger']">
                    {{ impactRule.amount > 0 ? '+' : '-' }}${{ Math.abs(impactRule.amount).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import DataTable from '../../components/common/DataTable.vue'
import BaseModal from '../../components/common/BaseModal.vue'
import SearchFilter from '../../components/common/SearchFilter.vue'
import { usePayrollRuleStore } from '@/stores/payrollRuleStore'
import payrollRuleService from '../../services/payrollRuleService.js'

export default {
  name: 'PayrollRuleManagement',
  components: {
    DataTable,
    BaseModal,
    SearchFilter
  },
  setup() {
    const store = usePayrollRuleStore()

    // state from store
    const payrollRules = computed(() => store.payrollRules)
    const allPayrollRules = computed(() => store.allPayrollRules)
    const loading = computed(() => store.loading)
    const error = computed(() => store.error)

    // local state
    const showAddModal = ref(false)
    const showDetailsModal = ref(false)
    const showImpactModal = ref(false)
    const impactLoading = ref(false)
    const editingRule = ref(null)
    const selectedRule = ref(null)
    const impactRule = ref(null)
    const validationErrors = ref({})

    // filters
    const searchQuery = ref('')
    const filters = ref({ rule_type: '' })

    // form
    const ruleForm = ref({
      rule_name: '',
      rule_type: '',
      calculation_type: '',
      amount: ''
    })

    // options
    const ruleTypeOptions = payrollRuleService.getRuleTypeOptions()
    const calculationTypeOptions = payrollRuleService.getCalculationTypeOptions()

    // table columns
    const ruleColumns = [
      { key: 'rule_name', label: 'Rule Name' },
      { key: 'rule_type', label: 'Type' },
      { key: 'calculation_type', label: 'Calculation' },
      { key: 'amount', label: 'Amount' },
      { key: 'impact', label: 'Impact' },
      { key: 'actions', label: 'Actions' }
    ]

    // filters config
    const filterConfig = [
      {
        key: 'rule_type',
        placeholder: 'All Types',
        options: ruleTypeOptions
      }
    ]

    // stats
    const lateRulesCount = computed(() => store.lateRulesCount)
    const overtimeRulesCount = computed(() => store.overtimeRulesCount)
    const absenceRulesCount = computed(() => store.absenceRulesCount)
    const leaveRulesCount = computed(() => store.leaveRulesCount)

    // fetch
    const fetchPayrollRules = () => store.fetchPayrollRules()

    // filters
    const handleFilterChange = (filterData) => {
      searchQuery.value = filterData.search
      filters.value = filterData.filters
      store.applyFilters(searchQuery.value, filters.value)
    }

    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = { rule_type: '' }
      store.applyFilters('', {})
    }

    
    const editRule = (rule) => {
      editingRule.value = rule
      ruleForm.value = {
        rule_name: rule.rule_name,
        rule_type: rule.rule_type,
        calculation_type: rule.calculation_type,
        amount: rule.amount
      }
      showAddModal.value = true
    }

    // save
    const saveRule = async () => {
      validationErrors.value = {}

      const formData = {
        rule_name: ruleForm.value.rule_name.trim(),
        rule_type: ruleForm.value.rule_type,
        calculation_type: ruleForm.value.calculation_type,
        amount: parseFloat(ruleForm.value.amount)
      }

      try {
        if (editingRule.value) {
          await store.updateRule(editingRule.value.id, formData)
        } else {
          await store.createRule(formData)
        }

        closeModal()
      } catch (err) {
        if (err.response?.status === 422) {
          validationErrors.value = err.response.data.errors || {}
        }
      }
    }

    // view
    const viewRule = async (rule) => {
      try {
        const res = await store.getRule(rule.id)
        selectedRule.value = res.data || res
      } catch {
        selectedRule.value = rule
      }

      showDetailsModal.value = true
    }

    // delete
    const deleteRule = async (rule) => {
      if (!confirm(`Are you sure you want to delete "${rule.rule_name}"?`)) return
      await store.deleteRule(rule.id)
    }

    // preview
    const previewImpact = (rule) => {
      impactRule.value = rule
      showImpactModal.value = true
    }

    // modals
    const closeModal = () => {
      showAddModal.value = false
      editingRule.value = null
      ruleForm.value = {
        rule_name: '',
        rule_type: '',
        calculation_type: '',
        amount: ''
      }
      validationErrors.value = {}
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedRule.value = null
    }

    const closeImpactModal = () => {
      showImpactModal.value = false
      impactRule.value = null
    }

    // auto calc type
    const onRuleTypeChange = () => {
      if (['late', 'overtime'].includes(ruleForm.value.rule_type)) {
        ruleForm.value.calculation_type = 'per_minute'
      } else {
        ruleForm.value.calculation_type = 'fixed'
      }
    }

    // helpers
    const getRuleTypeInfo = (type) => payrollRuleService.getRuleTypeInfo(type)
    const getCalculationTypeInfo = (type) => payrollRuleService.getCalculationTypeInfo(type)
    const formatAmount = (amount, type) => payrollRuleService.formatAmount(amount, type)

    const getRuleTypeBadgeClass = (type) => {
      return `rule-type-badge ${getRuleTypeInfo(type).color}`
    }

    const getAmountClass = (type) => {
      return `amount-badge ${getRuleTypeInfo(type).color}`
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US')
    }

    // mount
    onMounted(() => {
      fetchPayrollRules()
    })

    return {
      payrollRules,
      allPayrollRules,
      loading,
      error,
      showAddModal,
      showDetailsModal,
      showImpactModal,
      impactLoading,
      editingRule,
      selectedRule,
      impactRule,
      validationErrors,
      searchQuery,
      filters,
      ruleForm,
      ruleTypeOptions,
      calculationTypeOptions,
      ruleColumns,
      filterConfig,
      lateRulesCount,
      overtimeRulesCount,
      absenceRulesCount,
      leaveRulesCount,
      fetchPayrollRules,
      handleFilterChange,
      clearFilters,
      saveRule,
      editRule, 
      viewRule,
      deleteRule,
      previewImpact,
      closeModal,
      closeDetailsModal,
      closeImpactModal,
      onRuleTypeChange,
      getRuleTypeInfo,
      getCalculationTypeInfo,
      formatAmount,
      getRuleTypeBadgeClass,
      getAmountClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.payroll-rule-management {
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

.add-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.stat-icon.danger {
  background: #f8d7da;
  color: #721c24;
}

.stat-icon.success {
  background: #d4edda;
  color: #155724;
}

.stat-icon.warning {
  background: #fff3cd;
  color: #856404;
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

.rule-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-icon {
  font-size: 16px;
}

.name-text {
  font-weight: 600;
  color: #6c757d;
}

.rule-type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rule-type-badge.danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.rule-type-badge.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.rule-type-badge.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.calculation-info {
  display: flex;
  flex-direction: column;
}

.calc-type {
  font-weight: 600;
  color: #6c757d;
  font-size: 14px;
}

.calc-unit {
  font-size: 12px;
  color: #999;
}

.amount-info {
  display: flex;
  align-items: center;
}

.amount-value {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
}

.amount-badge.danger {
  background: #f8d7da;
  color: #721c24;
}

.amount-badge.success {
  background: #d4edda;
  color: #155724;
}

.amount-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.preview-btn {
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

.preview-btn:hover:not(:disabled) {
  background: #d6d8db;
  transform: translateY(-1px);
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.edit-btn {
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

.edit-btn:hover:not(:disabled) {
  background: #bee5eb;
  transform: translateY(-1px);
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

.delete-btn {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: #f5c6cb;
  transform: translateY(-1px);
}

.rule-form {
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

.unit-hint {
  padding: 12px 15px;
  background: #f8f9fa;
  color: #999;
  font-size: 12px;
  font-weight: 500;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.rule-preview {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.rule-preview h4 {
  margin-bottom: 10px;
  color: #6c757d;
  font-size: 14px;
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #6c757d;
}

.preview-icon {
  font-size: 16px;
}

.rule-details {
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

.impact-example p {
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.impact-preview-modal {
  padding: 10px 0;
}

.impact-calculation h4 {
  margin-bottom: 20px;
  color: #6c757d;
}

.calculation-scenarios h5 {
  margin-bottom: 15px;
  color: #6c757d;
  font-size: 16px;
}

.scenario-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.scenario-label {
  color: #6c757d;
  font-weight: 500;
}

.scenario-amount {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.scenario-amount.success {
  background: #d4edda;
  color: #155724;
}

.scenario-amount.danger {
  background: #f8d7da;
  color: #721c24;
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
