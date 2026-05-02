import apiClient from './apiClient'

const authService = {
  async login(credentials) {
    const response = await apiClient.post('/login', credentials)
    return response.data
  },

  async getUser() {
    const response = await apiClient.get('/user')
    return response.data
  },

  async logout() {
    try {
      await apiClient.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
    }
  }
}

export default authService
