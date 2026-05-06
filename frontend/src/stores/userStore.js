import { defineStore } from 'pinia'
import userService from '@/services/userService'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Data
    users: [],
    allUsers: [], // Store all users for frontend filtering
    editingUser: null,
    
    // Loading states
    loading: false,
    
    // Error state
    error: '',
    
    // Modal states
    showAddModal: false,
    
    // Search and filters
    searchQuery: '',
    filters: {
      role: '',
      status: '',
      department_id: ''
    },
    
    // Form data
    userForm: {
      name: '',
      email: '',
      password: '',
      role: '',
      status: 'active',
      employee_number: '',
      hire_date: '',
      employment_status: ''
    }
  }),

  getters: {
    // Columns definitions
    userColumns() {
      return [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' }
      ]
    },
    
    // Filter configuration
    filterConfig() {
      return [
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
    },
    
    // Computed property for filtered users
    filteredUsers() {
      return this.users
    }
  },

  actions: {
    // Fetch users
    async fetchUsers(filters = {}) {
      this.loading = true
      this.error = ''
      
      try {
        console.log('Fetching users with filters:', filters)
        const fetchedUsers = await userService.getUsers(filters)
        console.log('Users fetched:', fetchedUsers)
        
        this.allUsers = Array.isArray(fetchedUsers) ? fetchedUsers : []
        
        // Apply frontend filtering
        this.applyFrontendFilters()
      } catch (err) {
        console.error('Error fetching users:', err)
        this.error = err.response?.data?.message || 'Failed to fetch users. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    // Apply frontend filtering
    applyFrontendFilters() {
      let filteredUsers = [...this.allUsers]
      
      // Apply search filter
      if (this.searchQuery.trim()) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim())
        )
      }
      
      // Apply role filter
      if (this.filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === this.filters.role)
      }
      
      // Apply status filter
      if (this.filters.status) {
        filteredUsers = filteredUsers.filter(user => user.status === this.filters.status)
      }
      
      // Apply department filter
      if (this.filters.department_id) {
        filteredUsers = filteredUsers.filter(user => 
          user.employee?.department_id == this.filters.department_id
        )
      }
      
      this.users = filteredUsers
    },
    
    // Update filters
    handleFilterChange(filterData) {
      this.searchQuery = filterData.search
      this.filters = filterData.filters
      this.applyFrontendFilters()
    },
    
    // Clear filters
    clearFilters() {
      this.searchQuery = ''
      this.filters = {
        role: '',
        status: '',
        department_id: ''
      }
      this.applyFrontendFilters()
    },
    
    // Save user (create or update)
    async saveUser() {
      this.loading = true
      this.error = ''
      
      try {
        const userData = { ...this.userForm }
        
        // Remove password from update if it's empty
        if (this.editingUser && !userData.password) {
          delete userData.password
        }
        
        if (this.editingUser) {
          await userService.updateUser(this.editingUser.id, userData)
        } else {
          await userService.createUser(userData)
        }
        
        await this.fetchUsers()
        this.closeModal()
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to save user. Please try again.'
        console.error('Error saving user:', err)
      } finally {
        this.loading = false
      }
    },
    
    // Edit user
    editUser(user) {
      this.editingUser = user
      this.userForm = { 
        name: user.name,
        role: user.role,
        status: user.status,
        employee_number: user.employee?.employee_number || '',
        hire_date: user.employee?.hire_date || '',
        employment_status: user.employee?.employment_status || ''
      }
      this.showAddModal = true
    },
    
    // Delete user
    async deleteUser(userId) {
      this.loading = true
      this.error = ''
      
      try {
        await userService.deleteUser(userId)
        await this.fetchUsers()
      } catch (err) {
        this.error = 'Failed to delete user. Please try again.'
        console.error('Error deleting user:', err)
      } finally {
        this.loading = false
      }
    },
    
    // Reactivate user
    async reactivateUser(userId) {
      this.loading = true
      this.error = ''
      
      try {
        await userService.reactivateUser(userId)
        await this.fetchUsers()
      } catch (err) {
        this.error = 'Failed to reactivate user. Please try again.'
        console.error('Error reactivating user:', err)
      } finally {
        this.loading = false
      }
    },
    
    // Update profile
    async updateProfile(profileData) {
      try {
        const response = await userService.updateProfile(profileData)
        return response
      } catch (err) {
        console.error('Error updating profile:', err)
        throw err
      }
    },
    
    // Modal management
    openAddModal() {
      this.showAddModal = true
    },
    
    closeAddModal() {
      this.showAddModal = false
    },
    
    closeModal() {
      this.showAddModal = false
      this.editingUser = null
      this.userForm = {
        name: '',
        email: '',
        password: '',
        role: '',
        status: 'active',
        employee_number: '',
        hire_date: '',
        employment_status: ''
      }
    },
    
    // Form update methods
    updateUserForm(field, value) {
      this.userForm[field] = value
    },
    
    // Helper methods
    getRoleClass(role) {
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
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'active':
          return 'status-badge active'
        case 'inactive':
          return 'status-badge inactive'
        default:
          return 'status-badge'
      }
    }
  }
})
