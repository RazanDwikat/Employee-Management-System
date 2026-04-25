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
            <td>{{ department.employees_count || 0 }}</td>
            <td>
              <button @click="editDepartment(department)" class="edit-btn">Edit</button>
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
            <label>Department Name</label>
            <input v-model="departmentForm.name" type="text" required :disabled="loading" />
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
    const editingDepartment = ref(null)
    const departmentForm = ref({
      name: '',
      manager_id: ''
    })
    
    const fetchDepartments = async () => {
      loading.value = true
      error.value = ''
      
      try {
        departments.value = await departmentService.getDepartments()
      } catch (err) {
        error.value = 'Failed to fetch departments. Please try again.'
        console.error('Error fetching departments:', err)
      } finally {
        loading.value = false
      }
    }
    
    const fetchManagers = async () => {
      try {
        const allUsers = await userService.getUsers()
        managers.value = allUsers.filter(user => user.role === 'manager')
      } catch (err) {
        console.error('Error fetching managers:', err)
        managers.value = []
      }
    }
    
    const saveDepartment = async () => {
      loading.value = true
      error.value = ''
      
      try {
        if (editingDepartment.value) {
          await departmentService.updateDepartment(editingDepartment.value.id, departmentForm.value)
        } else {
          await departmentService.createDepartment(departmentForm.value)
        }
        
        await fetchDepartments()
        closeModal()
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to save department. Please try again.'
        console.error('Error saving department:', err)
      } finally {
        loading.value = false
      }
    }
    
    const editDepartment = (department) => {
      editingDepartment.value = department
      departmentForm.value = { 
        name: department.name,
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
      error.value = ''
      departmentForm.value = {
        name: '',
        manager_id: ''
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
      editingDepartment,
      departmentForm,
      saveDepartment,
      editDepartment,
      deleteDepartment,
      closeModal
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
  color: #2c3e50;
}

.actions-bar {
  margin-bottom: 20px;
}

.add-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.departments-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  background: #f8f9fa;
  font-weight: 600;
}

.edit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
  cursor: pointer;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
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
