<template>
  <div class="dashboard">
    <h1>Welcome to Dashboard</h1>
    <p>You are logged in as: {{ authStore.user?.role }}</p>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const handleLogout = () => {
      authStore.logout()
      router.push('/login')
    }
    
    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  text-align: center;
}

button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
