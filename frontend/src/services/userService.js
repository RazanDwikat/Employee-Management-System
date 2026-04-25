import axios from 'axios'

const API_URL = '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

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
    const response = await apiClient.put(`/users/${userId}`, userData)
    return response.data
  },

  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}`)
    return response.data
  },

  async updateProfile(userData) {
    const response = await apiClient.put('/profile', userData)
    return response.data
  }
}

export default userService
