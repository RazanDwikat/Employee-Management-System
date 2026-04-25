<template>
  <div class="user-management">
    <h1>User Management</h1>
    
    <div class="actions-bar">
      <div class="search-filters">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            @input="fetchUsers"
            type="text" 
            placeholder="Search by name..."
            class="search-input"
            :disabled="loading"
          />
        </div>
        
        <div class="filter-controls">
          <select 
            v-model="filters.role" 
            @change="fetchUsers"
            class="filter-select"
            :disabled="loading"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          
          <select 
            v-model="filters.status" 
            @change="fetchUsers"
            class="filter-select"
            :disabled="loading"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button 
            @click="clearFilters"
            class="clear-btn"
            :disabled="loading || (!searchQuery && !filters.role && !filters.status)"
          >
            Clear Filters
          </button>
        </div>
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
    
    <div v-else class="users-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="user.status">
                {{ user.status }}
              </span>
            </td>
            <td>
              <button @click="editUser(user)" class="edit-btn">Edit</button>
              <button @click="deleteUser(user.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <h3>{{ editingUser ? 'Edit User' : 'Add New User' }}</h3>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Name</label>
            <input v-model="userForm.name" type="text" required :disabled="loading" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="userForm.email" type="email" required :disabled="loading" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="userForm.password" type="password" :required="!editingUser" :disabled="loading" />
            <small v-if="editingUser">Leave empty to keep current password</small>
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
            <label>Status</label>
            <select v-model="userForm.status" required :disabled="loading">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
import { useAuthStore } from '../../stores/auth'
import userService from '../../services/userService'

export default {
  name: 'UserManagement',
  setup() {
    const authStore = useAuthStore()
    
    const users = ref([])
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
      status: 'active'
    })
    
    const fetchUsers = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const searchFilters = {}
        
        // Add search query
        if (searchQuery.value.trim()) {
          searchFilters.name = searchQuery.value.trim()
        }
        
        // Add filters
        if (filters.value.role) {
          searchFilters.role = filters.value.role
        }
        
        if (filters.value.status) {
          searchFilters.status = filters.value.status
        }
        
        if (filters.value.department_id) {
          searchFilters.department_id = filters.value.department_id
        }
        
        users.value = await userService.getUsers(searchFilters)
      } catch (err) {
        console.error('Error fetching users:', err)
        error.value = err.response?.data?.message || 'Failed to fetch users. Please try again.'
      } finally {
        loading.value = false
      }
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
        email: user.email,
        password: '',
        role: user.role,
        status: user.status
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
    
    const closeModal = () => {
      showAddModal.value = false
      editingUser.value = null
      error.value = ''
      userForm.value = {
        name: '',
        email: '',
        password: '',
        role: '',
        status: 'active'
      }
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      filters.value = {
        role: '',
        status: '',
        department_id: ''
      }
      fetchUsers()
    }
    
    onMounted(() => {
      fetchUsers()
    })
    
    return {
      users,
      loading,
      error,
      showAddModal,
      editingUser,
      searchQuery,
      filters,
      userForm,
      fetchUsers,
      saveUser,
      editUser,
      deleteUser,
      closeModal,
      clearFilters
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #2c3e50;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #2c3e50;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.clear-btn:hover:not(:disabled) {
  background: #5a6268;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.users-table {
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

.role-badge, .status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.admin { background: #e74c3c; color: white; }
.role-badge.manager { background: #f39c12; color: white; }
.role-badge.employee { background: #3498db; color: white; }

.status-badge.active { background: #27ae60; color: white; }
.status-badge.inactive { background: #95a5a6; color: white; }

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

small {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}
</style>
