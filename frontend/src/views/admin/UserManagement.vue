<template>
  <div class="user-management">
    <h1>User Management</h1>
    
    <div class="actions-bar">
      <div class="search-section">
        <SearchFilter 
          v-model:searchQuery="searchQuery"
          :filters="filterConfig"
          :loading="loading"
          search-placeholder="Search by name..."
          @filter-change="handleFilterChange"
          @clear-filters="clearFilters"
        />
      </div>
      
      <button @click="showAddModal = true" class="add-btn" :disabled="loading">
        Add New User
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="loading" class="loading">
      Loading users...
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="filteredUsers" 
      :columns="userColumns" 
      :loading="loading"
    >
      <template #cell-role="{ item }">
        <span :class="getRoleClass(item.role)">
          {{ item.role }}
        </span>
      </template>
      
      <template #cell-status="{ item }">
        <span :class="getStatusClass(item.status)">
          {{ item.status }}
        </span>
      </template>
      
      <template #cell-actions="{ item }">
        <button @click="editUser(item)" class="edit-btn">Edit</button>
        <button 
          v-if="item.status === 'inactive'" 
          @click="reactivateUser(item.id)" 
          class="reactivate-btn"
        >
          Reactivate
        </button>
        <button 
          v-else 
          @click="deleteUser(item.id)" 
          class="delete-btn"
        >
          Delete
        </button>
      </template>
    </DataTable>
    
    <!-- Add/Edit User Modal -->
    <BaseModal 
      v-model="showAddModal"
      :title="editingUser ? 'Edit User' : 'Add New User'"
      :loading="loading"
      loading-text="Saving..."
      save-text="Save"
      @save="saveUser"
      @cancel="closeModal"
    >
      <template #body>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Name</label>
            <input v-model="userForm.name" type="text" required :disabled="loading" />
          </div>
          
          <!-- Email and Password only for Add New User -->
          <div v-if="!editingUser" class="form-group">
            <label>Email</label>
            <input v-model="userForm.email" type="email" required :disabled="loading" />
          </div>
          <div v-if="!editingUser" class="form-group">
            <label>Password</label>
            <input v-model="userForm.password" type="password" required :disabled="loading" />
          </div>
          
          <div class="form-group">
            <label>Role</label>
            <select v-model="userForm.role" required :disabled="loading">
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div class="form-group">
            <label>Employee Number</label>
            <input v-model="userForm.employee_number" type="text" :disabled="loading" />
          </div>
          <div class="form-group">
            <label>Hire Date</label>
            <input v-model="userForm.hire_date" type="date" :disabled="loading" />
          </div>
          <div class="form-group">
            <label>Employment Status</label>
            <select v-model="userForm.employment_status" :disabled="loading">
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="userForm.status" required :disabled="loading">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import userService from '../../services/userService'
import DataTable from '../../components/common/DataTable.vue'
import BaseModal from '../../components/common/BaseModal.vue'
import SearchFilter from '../../components/common/SearchFilter.vue'

export default {
  name: 'UserManagement',
  components: {
    DataTable,
    BaseModal,
    SearchFilter
  },
  setup() {
    const authStore = useAuthStore()
    
    const users = ref([])
    const allUsers = ref([]) // Store all users for frontend filtering
    const loading = ref(false)
    const error = ref('')
    const showAddModal = ref(false)
    const editingUser = ref(null)
    
    // Search and filters
    const searchQuery = ref('')
    const filters = ref({
      role: '',
      status: '',
      department_id: ''
    })
    
    const userForm = ref({
      name: '',
      email: '',
      password: '',
      role: '',
      status: 'active',
      employee_number: '',
      hire_date: '',
      employment_status: ''
    })
    
    // Columns definitions
    const userColumns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' }
    ]
    
    // Filter configuration
    const filterConfig = [
      {
        key: 'role',
        placeholder: 'All Roles',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'manager', label: 'Manager' },
          { value: 'employee', label: 'Employee' }
        ]
      },
      {
        key: 'status',
        placeholder: 'All Status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      }
    ]
    
    // Computed property for filtered users
    const filteredUsers = computed(() => users.value)
    
    const fetchUsers = async () => {
      loading.value = true
      error.value = ''
      
      try {
        // Fetch all users without filters
        const fetchedUsers = await userService.getUsers()
        allUsers.value = fetchedUsers
        
        // Apply frontend filtering
        applyFrontendFilters()
      } catch (err) {
        console.error('Error fetching users:', err)
        error.value = err.response?.data?.message || 'Failed to fetch users. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    const applyFrontendFilters = () => {
      let filteredUsers = [...allUsers.value]
      
      // Apply search filter
      if (searchQuery.value.trim()) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
        )
      }
      
      // Apply role filter
      if (filters.value.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.value.role)
      }
      
      // Apply status filter
      if (filters.value.status) {
        filteredUsers = filteredUsers.filter(user => user.status === filters.value.status)
      }
      
      // Apply department filter
      if (filters.value.department_id) {
        filteredUsers = filteredUsers.filter(user => 
          user.employee?.department_id == filters.value.department_id
        )
      }
      
      users.value = filteredUsers
    }
    
    const handleFilterChange = (filterData) => {
      searchQuery.value = filterData.search
      filters.value = filterData.filters
      applyFrontendFilters()
    }
    
    const saveUser = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const userData = { ...userForm.value }
        
        // Remove password from update if it's empty
        if (editingUser.value && !userData.password) {
          delete userData.password
        }
        
        if (editingUser.value) {
          await userService.updateUser(editingUser.value.id, userData)
        } else {
          await userService.createUser(userData)
        }
        
        await fetchUsers()
        closeModal()
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to save user. Please try again.'
        console.error('Error saving user:', err)
      } finally {
        loading.value = false
      }
    }
    
    const editUser = (user) => {
      editingUser.value = user
      userForm.value = { 
        name: user.name,
        role: user.role,
        status: user.status,
        employee_number: user.employee?.employee_number || '',
        hire_date: user.employee?.hire_date || '',
        employment_status: user.employee?.employment_status || ''
      }
      showAddModal.value = true
    }
    
    const deleteUser = async (userId) => {
      if (confirm('Are you sure you want to delete this user?')) {
        loading.value = true
        error.value = ''
        
        try {
          await userService.deleteUser(userId)
          await fetchUsers()
        } catch (err) {
          error.value = 'Failed to delete user. Please try again.'
          console.error('Error deleting user:', err)
        } finally {
          loading.value = false
        }
      }
    }
    
    const reactivateUser = async (userId) => {
      if (confirm('Are you sure you want to reactivate this user?')) {
        loading.value = true
        error.value = ''
        
        try {
          await userService.reactivateUser(userId)
          await fetchUsers()
        } catch (err) {
          error.value = 'Failed to reactivate user. Please try again.'
          console.error('Error reactivating user:', err)
        } finally {
          loading.value = false
        }
      }
    }
    
    const closeModal = () => {
      showAddModal.value = false
      editingUser.value = null
      userForm.value = {
        name: '',
        email: '',
        password: '',
        role: '',
        status: 'active',
        employee_number: '',
        hire_date: '',
        employment_status: ''
      }
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = {
        role: '',
        status: '',
        department_id: ''
      }
      applyFrontendFilters()
    }
    
    const getRoleClass = (role) => {
      switch (role) {
        case 'admin':
          return 'role-badge admin'
        case 'manager':
          return 'role-badge manager'
        case 'employee':
          return 'role-badge employee'
        default:
          return 'role-badge'
      }
    }
    
    const getStatusClass = (status) => {
      switch (status) {
        case 'active':
          return 'status-badge active'
        case 'inactive':
          return 'status-badge inactive'
        default:
          return 'status-badge'
      }
    }
    
    onMounted(() => {
      fetchUsers()
    })
    
    return {
      users,
      allUsers,
      filteredUsers,
      loading,
      error,
      showAddModal,
      editingUser,
      searchQuery,
      filters,
      userForm,
      userColumns,
      filterConfig,
      fetchUsers,
      saveUser,
      editUser,
      deleteUser,
      reactivateUser,
      closeModal,
      applyFrontendFilters,
      handleFilterChange,
      clearFilters,
      getRoleClass,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.user-management {
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


.add-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.users-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
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

.role-badge, .status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin { 
  background: #f8d7da; 
  color: #721c24; 
  border: 1px solid #f5c6cb;
}
.role-badge.manager { 
  background: #fff3cd; 
  color: #856404; 
  border: 1px solid #ffeeba;
}
.role-badge.employee { 
  background: #d1ecf1; 
  color: #0c5460; 
  border: 1px solid #bee5eb;
}

.status-badge.active { 
  background: #d4edda; 
  color: #155724; 
  border: 1px solid #c3e6cb;
}
.status-badge.inactive { 
  background: #f8f9fa; 
  color: #6c757d; 
  border: 1px solid #dee2e6;
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

.reactivate-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 5px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reactivate-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
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

.form-group input, .form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
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
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #f5c6cb;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
}

small {
  color: #6c757d;
  font-size: 12px;
  margin-top: 4px;
  display: block;
  font-style: italic;
}
</style>
