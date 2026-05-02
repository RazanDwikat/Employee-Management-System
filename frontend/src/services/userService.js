import apiClient from './apiClient'

const userService = {
  async getUsers(filters = {}) {
    console.log('Making API call to /users with filters:', filters)
    const response = await apiClient.get('/users', {
      params: { 
        per_page: 1000, // Get all users
        ...filters
      }
    })
    console.log('API response:', response)
    console.log('Response data:', response.data)
    
    // Handle paginated response
    if (response.data.data) {
      return response.data.data
    }
    
    return response.data
  },

  async getUser(userId) {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  },

  async createUser(userData) {
    const response = await apiClient.post('/users', userData)
    return response.data
  },

  async updateUser(userId, userData) {
    console.log('Updating user:', userId, 'with data:', userData)
    const response = await apiClient.put(`/users/${userId}`, userData)
    console.log('Update response:', response.data)
    return response.data
  },

  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}`)
    return response.data
  },

  async updateProfile(userData) {
    const response = await apiClient.put('/admin/profile', userData)
    return response.data
  },

  async reactivateUser(userId) {
    console.log('Reactivating user:', userId)
    const response = await apiClient.post(`/users/${userId}/reactivate`)
    console.log('Reactivate response:', response.data)
    return response.data
  }
}

export default userService
