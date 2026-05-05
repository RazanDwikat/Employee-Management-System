<template>
  <div class="leave-type-management">
    <h1>Leave Type Management</h1>
    
    <div class="actions-bar">
      <div class="search-section">
        <SearchFilter 
          v-model:searchQuery="searchQuery"
          :filters="filterConfig"
          :loading="loading"
          search-placeholder="Search leave types..."
          @filter-change="handleFilterChange"
          @clear-filters="clearFilters"
        />
      </div>
      
      <button @click="showAddModal = true" class="add-btn" :disabled="loading">
        Add New Leave Type
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="leaveTypes" 
      :columns="leaveTypeColumns" 
      :loading="loading"
    >
      <template #cell-is_paid="{ item }">
        <span :class="getPaidClass(item.is_paid)">
          {{ item.is_paid ? 'Paid' : 'Unpaid' }}
        </span>
      </template>
      
      <template #cell-max_days="{ item }">
        {{ item.max_days }} {{ item.max_days === 1 ? 'day' : 'days' }}
      </template>
      
      <template #cell-actions="{ item }">
        <button @click="editLeaveType(item)" class="edit-btn">Edit</button>
        <button @click="deleteLeaveType(item.id)" class="delete-btn">Delete</button>
      </template>
    </DataTable>
    
    <!-- Add/Edit Leave Type Modal -->
    <BaseModal 
      v-model="showAddModal"
      :title="editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'"
      :loading="loading"
      loading-text="Saving..."
      save-text="Save"
      @save="saveLeaveType"
      @cancel="closeModal"
    >
      <template #body>
        <form @submit.prevent="saveLeaveType">
          <div class="form-group">
            <label for="name">Leave Type Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="leaveTypeForm.name" 
              placeholder="Enter leave type name"
              required
              :disabled="loading"
            >
            <div v-if="validationErrors.name" class="error-text">
              {{ validationErrors.name[0] }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="max_days">Maximum Days</label>
            <input 
              type="number" 
              id="max_days" 
              v-model="leaveTypeForm.max_days" 
              placeholder="Enter maximum days"
              min="0"
              required
              :disabled="loading"
            >
            <div v-if="validationErrors.max_days" class="error-text">
              {{ validationErrors.max_days[0] }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="is_paid">Leave Type</label>
            <select 
              id="is_paid" 
              v-model="leaveTypeForm.is_paid" 
              required
              :disabled="loading"
            >
              <option :value="true">Paid Leave</option>
              <option :value="false">Unpaid Leave</option>
            </select>
            <div v-if="validationErrors.is_paid" class="error-text">
              {{ validationErrors.is_paid[0] }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              v-model="leaveTypeForm.description" 
              placeholder="Enter leave type description"
              rows="3"
              :disabled="loading"
            ></textarea>
            <div v-if="validationErrors.description" class="error-text">
              {{ validationErrors.description[0] }}
            </div>
          </div>
        </form>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import DataTable from '../../components/common/DataTable.vue'
import BaseModal from '../../components/common/BaseModal.vue'
import SearchFilter from '../../components/common/SearchFilter.vue'
import { useLeaveStore } from '@/stores/leaveStore'
import { storeToRefs } from 'pinia'

export default {
  name: 'LeaveTypeManagement',
  components: {
    DataTable,
    BaseModal,
    SearchFilter
  },
  setup() {

    const leaveStore = useLeaveStore()
    const { leaveTypes, loading, error } = storeToRefs(leaveStore)

    const allLeaveTypes = ref([])
    const showAddModal = ref(false)
    const editingLeaveType = ref(null)
    const validationErrors = ref({})

    // Search & Filters
    const searchQuery = ref('')
    const filters = ref({
      is_paid: ''
    })

    // Form
    const leaveTypeForm = ref({
      name: '',
      max_days: '',
      is_paid: true,
      description: ''
    })

    // Columns
    const leaveTypeColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Leave Type' },
      { key: 'max_days', label: 'Max Days' },
      { key: 'is_paid', label: 'Type' },
      { key: 'description', label: 'Description' },
      { key: 'actions', label: 'Actions' }
    ]

    const filterConfig = [
      {
        key: 'is_paid',
        placeholder: 'All Types',
        options: [
          { value: 'true', label: 'Paid Leave' },
          { value: 'false', label: 'Unpaid Leave' }
        ]
      }
    ]

    // 🔥 Fetch
    const fetchLeaveTypes = async () => {
      await leaveStore.fetchLeaveTypes()
      allLeaveTypes.value = leaveTypes.value
      applyFrontendFilters()
    }

    // 🔍 Filtering
    const filteredLeaveTypes = computed(() => {
      let data = [...allLeaveTypes.value]

      if (searchQuery.value.trim()) {
        data = data.filter(type =>
          type.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (type.description || '').toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (filters.value.is_paid) {
        const isPaid = filters.value.is_paid === 'true'
        data = data.filter(type => {
          const val = type.is_paid === 1 || type.is_paid === true
          return val === isPaid
        })
      }

      return data
    })

    const applyFrontendFilters = () => {
      // مش ضروري بعد ما استخدمنا computed
    }

    const handleFilterChange = (filterData) => {
      searchQuery.value = filterData.search
      filters.value = filterData.filters
    }

    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = { is_paid: '' }
    }

    // 💾 Save
    const saveLeaveType = async () => {
      validationErrors.value = {}

      try {
        const formData = {
          name: leaveTypeForm.value.name.trim(),
          max_days: parseInt(leaveTypeForm.value.max_days),
          is_paid: leaveTypeForm.value.is_paid,
          description: leaveTypeForm.value.description?.trim() || ''
        }

        if (editingLeaveType.value) {
          await leaveStore.updateLeaveType(editingLeaveType.value.id, formData)
        } else {
          await leaveStore.createLeaveType(formData)
        }

        await fetchLeaveTypes()
        closeModal()

      } catch (err) {
        if (err.response?.status === 422) {
          validationErrors.value = err.response.data.errors || {}
        }
      }
    }

    // ✏️ Edit
    const editLeaveType = (item) => {
      editingLeaveType.value = item
      leaveTypeForm.value = {
        name: item.name,
        max_days: item.max_days,
        is_paid: item.is_paid,
        description: item.description || ''
      }
      showAddModal.value = true
    }

    // 🗑️ Delete
    const deleteLeaveType = async (id) => {
      if (!confirm('Are you sure?')) return
      await leaveStore.deleteLeaveType(id)
      await fetchLeaveTypes()
    }

    const closeModal = () => {
      showAddModal.value = false
      editingLeaveType.value = null
      leaveTypeForm.value = {
        name: '',
        max_days: '',
        is_paid: true,
        description: ''
      }
    }

    const getPaidClass = (isPaid) => {
      return isPaid ? 'status-badge paid' : 'status-badge unpaid'
    }

    onMounted(fetchLeaveTypes)

    return {
      leaveTypes: filteredLeaveTypes,
      loading,
      error,
      showAddModal,
      editingLeaveType,
      validationErrors,
      searchQuery,
      filters,
      leaveTypeForm,
      leaveTypeColumns,
      filterConfig,
      saveLeaveType,
      editLeaveType,
      deleteLeaveType,
      closeModal,
      handleFilterChange,
      clearFilters,
      getPaidClass
    }
  }
}
</script>

<style scoped>
.leave-type-management {
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
  white-space: nowrap;
}

.add-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
  box-sizing: border-box;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.form-group input:disabled, .form-group select:disabled, .form-group textarea:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.unpaid {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.edit-btn {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
  padding: 6px 12px;
  border-radius: 6px;
  margin-right: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-btn:hover:not(:disabled) {
  background: #bee5eb;
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
</style>
