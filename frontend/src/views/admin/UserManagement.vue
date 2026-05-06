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
      
      <button @click="openAddModal" class="add-btn" :disabled="loading">
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
      :model-value="showAddModal"
      @update:model-value="closeAddModal"
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
import { onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '@/stores/userStore'
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
    const userStore = useUserStore()
    
    onMounted(() => {
      userStore.fetchUsers()
    })
    
    return {
      // Store state as computed properties for reactivity
      users: computed(() => userStore.users),
      allUsers: computed(() => userStore.allUsers),
      filteredUsers: computed(() => userStore.filteredUsers),
      loading: computed(() => userStore.loading),
      error: computed(() => userStore.error),
      showAddModal: computed(() => userStore.showAddModal),
      editingUser: computed(() => userStore.editingUser),
      searchQuery: computed(() => userStore.searchQuery),
      filters: computed(() => userStore.filters),
      userForm: computed(() => userStore.userForm),
      
      // Store getters as computed properties
      userColumns: computed(() => userStore.userColumns),
      filterConfig: computed(() => userStore.filterConfig),
      
      // Store actions
      fetchUsers: userStore.fetchUsers,
      saveUser: userStore.saveUser,
      editUser: userStore.editUser,
      deleteUser: (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
          userStore.deleteUser(userId)
        }
      },
      reactivateUser: (userId) => {
        if (confirm('Are you sure you want to reactivate this user?')) {
          userStore.reactivateUser(userId)
        }
      },
      closeModal: userStore.closeModal,
      applyFrontendFilters: userStore.applyFrontendFilters,
      handleFilterChange: userStore.handleFilterChange,
      clearFilters: userStore.clearFilters,
      getRoleClass: userStore.getRoleClass,
      getStatusClass: userStore.getStatusClass,
      openAddModal: userStore.openAddModal,
      closeAddModal: userStore.closeAddModal,
      updateUserForm: userStore.updateUserForm
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
