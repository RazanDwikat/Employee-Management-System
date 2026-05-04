import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {


  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false
  }),

  
  getters: {
    isAuthenticated: (state) => !!state.token
  },

 
  actions: {

    async login(credentials) {
      this.loading = true
      try {
        const response = await authService.login(credentials)

        this.token = response.token
        this.user = response.user

        localStorage.setItem('token', this.token)

        return response
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await authService.logout()
      } catch (e) {
        console.warn('Logout API failed')
      }

      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    async fetchUser() {
      if (this.user) return this.user  

      try {
        const userData = await authService.getUser()
        this.user = userData
        return userData
      } catch (error) {
        this.logout()
        throw error
      }
    }

  }
})