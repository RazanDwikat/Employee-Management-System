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
    
    <div v-if="loading" class="loading">
      Loading departments...
    </div>
    
    <div v-else class="departments-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Manager</th>
            <th>Employees Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="department in departments" :key="department.id">
            <td>{{ department.id }}</td>
            <td>{{ department.name }}</td>
            <td>{{ department.manager?.name || 'Not Assigned' }}</td>
            <td>
              <button @click="showDepartmentEmployees(department)" class="employee-count-btn">
                {{ department.employees_count || 0 }}
              </button>
            </td>
            <td>
              <button @click="editDepartment(department)" class="edit-btn">Edit</button>
              <button @click="showAssignManagerModal(department)" class="assign-btn">Assign Manager</button>
              <button @click="deleteDepartment(department.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Add/Edit Department Modal -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <h3>{{ editingDepartment ? 'Edit Department' : 'Add New Department' }}</h3>
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
          <div class="modal-actions">
            <button type="submit" class="save-btn" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" @click="closeModal" class="cancel-btn" :disabled="loading">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Assign Manager Modal -->
    <div v-if="showAssignModal" class="modal">
      <div class="modal-content">
        <h3>Assign Manager to {{ selectedDepartment?.name }}</h3>
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
          <div class="modal-actions">
            <button type="submit" class="save-btn" :disabled="loading">
              {{ loading ? 'Assigning...' : 'Assign Manager' }}
            </button>
            <button type="button" @click="closeAssignModal" class="cancel-btn" :disabled="loading">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Department Employees Modal -->
    <div v-if="showEmployeesModal" class="modal">
      <div class="modal-content">
        <h3>Employees in {{ selectedDepartment?.name }}</h3>
        <div v-if="loadingEmployees" class="loading">
          Loading employees...
        </div>
        <div v-else-if="departmentEmployees.length === 0" class="no-employees">
          No employees found in this department.
        </div>
        <div v-else class="employees-list">
          <table>
            <thead>
              <tr>
                <th>Employee Number</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in departmentEmployees" :key="employee.id">
                <td>{{ employee.employee_number }}</td>
                <td>{{ employee.name || 'N/A' }}</td>
                <td>{{ employee.email || 'N/A' }}</td>
                <td>{{ employee.phone || 'N/A' }}</td>
                <td>
                  <span :class="getStatusClass(employee.employment_status)">
                    {{ employee.employment_status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-actions">
          <button @click="closeEmployeesModal" class="cancel-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import departmentService from '../../services/departmentService'
import userService from '../../services/userService'

export default {
  name: 'DepartmentManagement',
  setup() {
    const departments = ref([])
    const managers = ref([])
    const loading = ref(false)
    const error = ref('')
    const showAddModal = ref(false)
    const showAssignModal = ref(false)
    const showEmployeesModal = ref(false)
    const editingDepartment = ref(null)
    const selectedDepartment = ref(null)
    const departmentEmployees = ref([])
    const loadingEmployees = ref(false)
    const departmentForm = ref({
      name: '',
      description: '',
      manager_id: ''
    })
    const assignManagerForm = ref({
      manager_id: ''
    })
    
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
      loading.value = true
      error.value = ''
      
      try {
        console.log('Saving department...')
        console.log('Department form data:', departmentForm.value)
        console.log('Is editing:', !!editingDepartment.value)
        
        if (editingDepartment.value) {
          console.log('Updating existing department:', editingDepartment.value.id)
          await departmentService.updateDepartment(editingDepartment.value.id, departmentForm.value)
        } else {
          console.log('Creating new department')
          await departmentService.createDepartment(departmentForm.value)
        }
        
        console.log('Department saved successfully!')
        await fetchDepartments()
        closeModal()
      } catch (err) {
        console.error('Error saving department:', err)
        console.error('Error response:', err.response)
        error.value = err.response?.data?.message || 'Failed to save department. Please try again.'
      } finally {
        loading.value = false
      }
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
    
    const deleteDepartment = async (departmentId) => {
      if (confirm('Are you sure you want to delete this department?')) {
        loading.value = true
        error.value = ''
        
        try {
          await departmentService.deleteDepartment(departmentId)
          await fetchDepartments()
        } catch (err) {
          error.value = 'Failed to delete department. Please try again.'
          console.error('Error deleting department:', err)
        } finally {
          loading.value = false
        }
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
      loading.value = true
      error.value = ''
      
      try {
        await departmentService.assignManager(selectedDepartment.value.id, assignManagerForm.value.manager_id)
        await fetchDepartments()
        closeAssignModal()
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to assign manager. Please try again.'
        console.error('Error assigning manager:', err)
      } finally {
        loading.value = false
      }
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
      loadingEmployees.value = true
      
      try {
        const response = await departmentService.getDepartmentEmployees(department.id)
        departmentEmployees.value = response.employees || response
        console.log('Department employees:', departmentEmployees.value)
      } catch (err) {
        console.error('Error fetching department employees:', err)
        departmentEmployees.value = []
      } finally {
        loadingEmployees.value = false
      }
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
      fetchDepartments()
      fetchManagers()
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
