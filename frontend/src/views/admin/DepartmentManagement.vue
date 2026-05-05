<template>
  <div class="department-management">
    <h1>Department Management</h1>
    
    <div class="actions-bar">
      <button @click="showAddModal = true" class="add-btn" :disabled="loading">
        Add New Department
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="departments" 
      :columns="departmentColumns" 
      :loading="loading"
    >
      <template #cell-manager="{ item }">
        {{ item.manager?.name || 'Not Assigned' }}
      </template>
      
      <template #cell-employees_count="{ item }">
        <button @click="showDepartmentEmployees(item)" class="employee-count-btn">
          {{ item.employees_count || 0 }}
        </button>
      </template>
      
      <template #cell-actions="{ item }">
        <button @click="editDepartment(item)" class="edit-btn">Edit</button>
        <button @click="showAssignManagerModal(item)" class="assign-btn">Assign Manager</button>
        <button @click="deleteDepartment(item.id)" class="delete-btn">Delete</button>
      </template>
    </DataTable>
    
    <!-- Add/Edit Department Modal -->
    <BaseModal 
      v-model="showAddModal"
      :title="editingDepartment ? 'Edit Department' : 'Add New Department'"
      :loading="loading"
      loading-text="Saving..."
      save-text="Save"
      @save="saveDepartment"
      @cancel="closeModal"
    >
      <template #body>
        <form @submit.prevent="saveDepartment">
          <div class="form-group">
            <label for="name">Department Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="departmentForm.name" 
              placeholder="Enter department name"
              required
            >
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              v-model="departmentForm.description" 
              placeholder="Enter department description"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>Manager</label>
            <select v-model="departmentForm.manager_id" :disabled="loading">
              <option value="">Select Manager</option>
              <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                {{ manager.name }}
              </option>
            </select>
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- Assign Manager Modal -->
    <BaseModal 
      v-model="showAssignModal"
      :title="`Assign Manager to ${selectedDepartment?.name}`"
      :loading="loading"
      loading-text="Assigning..."
      save-text="Assign Manager"
      @save="assignManager"
      @cancel="closeAssignModal"
    >
      <template #body>
        <form @submit.prevent="assignManager">
          <div class="form-group">
            <label>Select Manager</label>
            <select v-model="assignManagerForm.manager_id" required :disabled="loading">
              <option value="">Select Manager</option>
              <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                {{ manager.name }}
              </option>
            </select>
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- Department Employees Modal -->
    <BaseModal 
      v-model="showEmployeesModal"
      :title="`Employees in ${selectedDepartment?.name}`"
      save-text="Close"
      @save="closeEmployeesModal"
      :show-footer="false"
    >
      <template #body>
        <div v-if="loadingEmployees" class="loading">
          Loading employees...
        </div>
        <div v-else-if="departmentEmployees.length === 0" class="no-employees">
          No employees found in this department.
        </div>
        <div v-else class="employees-list">
          <DataTable 
            :data="departmentEmployees" 
            :columns="employeeColumns" 
            :loading="loadingEmployees"
          >
            <template #cell-employment_status="{ item }">
              <span :class="getStatusClass(item.employment_status)">
                {{ item.employment_status }}
              </span>
            </template>
          </DataTable>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import DataTable from '../../components/common/DataTable.vue'
import BaseModal from '../../components/common/BaseModal.vue'
import { useDepartmentStore } from '@/stores/department'
import { storeToRefs } from 'pinia'

export default {
  name: 'DepartmentManagement',
  components: {
    DataTable,
    BaseModal
  },
  setup() {

    const departmentStore = useDepartmentStore()

  const {
    departments,
    managers,
    departmentEmployees,
    loading,
    loadingEmployees,
    error
  } = storeToRefs(departmentStore)

    const showAddModal = ref(false)
    const showAssignModal = ref(false)
    const showEmployeesModal = ref(false)
    const editingDepartment = ref(null)
    const selectedDepartment = ref(null)

  const departmentForm = ref({
    name: '',
    description: '',
    manager_id: ''
  })


    const assignManagerForm = ref({
      manager_id: ''
    })
    
    // Columns definitions
    const departmentColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'manager.name', label: 'Manager' },
      { key: 'employees_count', label: 'Employees Count' },
      { key: 'actions', label: 'Actions' }
    ]
    
    const employeeColumns = [
      { key: 'employee_number', label: 'Employee Number' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'employment_status', label: 'Status' }
    ]
    
    const fetchDepartments = async () => {
      loading.value = true
      error.value = ''
      
      try {
        console.log('Fetching departments...')
        const response = await departmentService.getDepartments()
        console.log('Raw API response:', response)
        departments.value = response.departments || response
        console.log('Departments assigned:', departments.value)
        console.log('First department:', departments.value[0])
        console.log('First department manager:', departments.value[0]?.manager)
      } catch (err) {
        error.value = 'Failed to fetch departments. Please try again.'
        console.error('Error fetching departments:', err)
      } finally {
        loading.value = false
      }
    }
    
    const fetchManagers = async () => {
      try {
        console.log('Fetching managers from department service...')
        const response = await departmentService.getManagers()
        managers.value = response.managers || response
        console.log('Managers loaded:', managers.value)
      } catch (err) {
        console.error('Error fetching managers:', err)
        managers.value = []
      }
    }
    
    const saveDepartment = async () => {
    if (editingDepartment.value) {
      await departmentStore.updateDepartment(
        editingDepartment.value.id,
        departmentForm.value
      )
    } else {
      await departmentStore.createDepartment(departmentForm.value)
    }

    closeModal()
  }

    
    const editDepartment = (department) => {
      editingDepartment.value = department
      departmentForm.value = { 
        name: department.name,
        description: department.description || '',
        manager_id: department.manager?.id || ''
      }
      showAddModal.value = true
    }
    
    const deleteDepartment = async (id) => {
    if (confirm('Are you sure?')) {
      await departmentStore.deleteDepartment(id)
    }
    }
    
    const closeModal = () => {
      showAddModal.value = false
      editingDepartment.value = null
      departmentForm.value = {
        name: '',
        description: '',
        manager_id: ''
      }
    }
    
    const showAssignManagerModal = (department) => {
      selectedDepartment.value = department
      assignManagerForm.value = {
        manager_id: department.manager?.id || ''
      }
      showAssignModal.value = true
    }
    
    const assignManager = async () => {
    await departmentStore.assignManager(
      selectedDepartment.value.id,
      assignManagerForm.value.manager_id
    )
    closeAssignModal()
  }
    
    const closeAssignModal = () => {
      showAssignModal.value = false
      selectedDepartment.value = null
      assignManagerForm.value = {
        manager_id: ''
      }
    }
    
    const showDepartmentEmployees = async (department) => {
    selectedDepartment.value = department
    showEmployeesModal.value = true
    await departmentStore.fetchDepartmentEmployees(department.id)
  }
    
    const closeEmployeesModal = () => {
      showEmployeesModal.value = false
      selectedDepartment.value = null
      departmentEmployees.value = []
    }
    
    const getStatusClass = (status) => {
      switch (status) {
        case 'active':
          return 'status-active'
        case 'inactive':
          return 'status-inactive'
        default:
          return 'status-unknown'
      }
    }
    
  onMounted(() => {
    departmentStore.fetchDepartments()
    departmentStore.fetchManagers()
  })
    
    return {
      departments,
      managers,
      loading,
      error,
      showAddModal,
      showAssignModal,
      showEmployeesModal,
      editingDepartment,
      selectedDepartment,
      departmentEmployees,
      loadingEmployees,
      departmentForm,
      assignManagerForm,
      departmentColumns,
      employeeColumns,
      saveDepartment,
      editDepartment,
      deleteDepartment,
      showAssignManagerModal,
      assignManager,
      closeModal,
      closeAssignModal,
      showDepartmentEmployees,
      closeEmployeesModal,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.department-management {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #6c757d;
  font-weight: 300;
  font-size: 24px;
}

.actions-bar {
  margin-bottom: 20px;
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

.departments-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #f1f3f4;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #fafbfc;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
  border-bottom: 1px solid #f1f3f4;
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

.assign-btn {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  padding: 6px 12px;
  border-radius: 6px;
  margin-right: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.assign-btn:hover:not(:disabled) {
  background: #ffeeba;
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

.employee-count-btn {
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

.employee-count-btn:hover:not(:disabled) {
  background: #bee5eb;
  transform: translateY(-1px);
}

.status-active { 
  background: #d4edda; 
  color: #155724; 
  border: 1px solid #c3e6cb;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-inactive { 
  background: #f8f9fa; 
  color: #6c757d; 
  border: 1px solid #dee2e6;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-unknown {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.employees-list {
  max-height: 400px;
  overflow-y: auto;
}

.employees-list table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.employees-list th,
.employees-list td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.employees-list th {
  background: #f8f9fa;
  font-weight: 600;
}

.no-employees {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #f1f3f4;
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
  resize: vertical;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
  justify-content: flex-end;
}

.save-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-1px);
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}
</style>
