<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-pattern"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo-section">
          <h1 class="app-title">Employee Management System</h1>
        </div>
        <p class="login-subtitle">Welcome back! Please sign in to your account</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <div class="input-wrapper">
            <input
              type="email"
              id="email"
              v-model="form.email"
              required
              placeholder="Enter your email address"
              :disabled="loading"
              class="form-input"
            />
           
          </div>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-wrapper">
            <input
              type="password"
              id="password"
              v-model="form.password"
              required
              placeholder="Enter your password"
              :disabled="loading"
              class="form-input"
            />
           
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <span>{{ error }}</span>
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else class="btn-content">
            <span class="btn-icon">🔐</span>
            <span>Sign In</span>
          </span>
          <span v-if="loading" class="loading-text">Signing in...</span>
        </button>
      </form>
      
      <div class="login-footer">
        <p class="footer-text">
          Secure login powered by modern encryption
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = ref({
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')
    
    const handleLogin = async () => {
      loading.value = true
      error.value = ''
      
      try {
        await authStore.login(form.value)
        
        // Redirect based on user role
        const userRole = authStore.user.role
        switch (userRole) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'manager':
            router.push('/manager/dashboard')
            break
          case 'employee':
            router.push('/employee/dashboard')
            break
          default:
            router.push('/dashboard')
        }
      } catch (err) {
        error.value = err.response?.data?.error || 'Login failed. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d1ede8 30%, #50837b 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.login-card {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #3d7d73 0%, #50837b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
  color: #374151;
}

.form-input:focus {
  outline: none;
  border-color: #3d7d73;
  background: white;
  box-shadow: 0 0 0 3px rgba(61, 125, 115, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}



.error-message {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #fca5a5;
}

.error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.login-btn {
  background: linear-gradient(135deg, #3d7d73 0%, #50837b 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(61, 125, 115, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2d6d63 0%, #40736b 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -1px rgba(61, 125, 115, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  font-size: 1.25rem;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-left: 0.5rem;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  color: #9ca3af;
  font-size: 0.75rem;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 640px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
  
  .logo-icon {
    font-size: 2.5rem;
  }
}

/* Input animations */
.form-input {
  transition: all 0.3s ease;
}

.form-input:focus + .input-icon {
  opacity: 1;
  color: #3d7d73;
}

/* Button ripple effect */
.login-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.login-btn:active::before {
  width: 300px;
  height: 300px;
}
</style>
