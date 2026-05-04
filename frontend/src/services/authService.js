
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
    await apiClient.post('/logout')
  }
}

export default authService