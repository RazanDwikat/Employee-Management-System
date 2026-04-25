<template>
  <div class="profile-management">
    <h1>Admin Profile</h1>
    
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar">
            <i class="user-icon">👤</i>
          </div>
          <h2>{{ authStore.user?.name }}</h2>
          <p class="role-badge admin">{{ authStore.user?.role }}</p>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-section">
          <h3>Profile Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Name</label>
              <p>{{ authStore.user?.name }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{ authStore.user?.email }}</p>
            </div>
            <div class="info-item">
              <label>Role</label>
              <p>{{ authStore.user?.role }}</p>
            </div>
            <div class="info-item">
              <label>Status</label>
              <p class="status-badge active">{{ authStore.user?.status }}</p>
            </div>
          </div>
        </div>

        <div class="edit-section">
          <h3>Edit Profile</h3>
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                v-model="profileForm.name" 
                type="text" 
                id="name" 
                required 
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                v-model="profileForm.email" 
                type="email" 
                id="email" 
                required 
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="current_password">Current Password</label>
              <input 
                v-model="profileForm.current_password" 
                type="password" 
                id="current_password" 
                placeholder="Enter current password to change"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="password">New Password</label>
              <input 
                v-model="profileForm.password" 
                type="password" 
                id="password" 
                placeholder="Leave blank to keep current password"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="password_confirmation">Confirm New Password</label>
              <input 
                v-model="profileForm.password_confirmation" 
                type="password" 
                id="password_confirmation" 
                placeholder="Confirm new password"
                :disabled="loading"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn" :disabled="loading">
                {{ loading ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import userService from '../../services/userService'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    const profileForm = ref({
      name: '',
      email: '',
      current_password: '',
      password: '',
      password_confirmation: ''
    })

    onMounted(() => {
      // Initialize form with current user data
      if (authStore.user) {
        profileForm.value.name = authStore.user.name
        profileForm.value.email = authStore.user.email
      }
    })

    const updateProfile = async () => {
      loading.value = true
      successMessage.value = ''
      errorMessage.value = ''

      try {
        // Validate password confirmation if new password is provided
        if (profileForm.value.password && profileForm.value.password !== profileForm.value.password_confirmation) {
          errorMessage.value = 'New password and confirmation do not match'
          loading.value = false
          return
        }

        // Prepare data for API
        const updateData = {
          name: profileForm.value.name,
          email: profileForm.value.email
        }

        // Only include password fields if current password is provided
        if (profileForm.value.current_password) {
          if (!profileForm.value.password) {
            errorMessage.value = 'Please enter new password when providing current password'
            loading.value = false
            return
          }
          updateData.current_password = profileForm.value.current_password
          updateData.password = profileForm.value.password
          updateData.password_confirmation = profileForm.value.password_confirmation
        }

        const response = await userService.updateProfile(updateData)
        
        // Update auth store with new user data
        authStore.setUser(response.user)
        
        successMessage.value = 'Profile updated successfully!'
        
        // Clear password fields
        profileForm.value.current_password = ''
        profileForm.value.password = ''
        profileForm.value.password_confirmation = ''
        
      } catch (error) {
        console.error('Profile update error:', error)
        errorMessage.value = error.response?.data?.message || 'Failed to update profile'
      } finally {
        loading.value = false
      }
    }

    return {
      authStore,
      loading,
      successMessage,
      errorMessage,
      profileForm,
      updateProfile
    }
  }
}
</script>

<style scoped>
.profile-management {
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

.profile-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
  border: 1px solid #f1f3f4;
  margin-bottom: 20px;
}

.profile-header {
  background: linear-gradient(135deg, #3d7d73 0%, #2e6359 100%);
  padding: 40px 30px;
  text-align: center;
  color: white;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 100px;
  height: 100px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255,255,255,0.3);
}

.user-icon {
  font-size: 48px;
}

.profile-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.profile-content {
  padding: 30px;
}

.info-section, .edit-section {
  margin-bottom: 40px;
}

.info-section h3, .edit-section h3 {
  margin-bottom: 20px;
  color: #6c757d;
  font-weight: 500;
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  background: #fafbfc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f1f3f4;
}

.info-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #6c757d;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.role-badge, .status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.role-badge.admin {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.profile-form {
  max-width: 600px;
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

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
}

.form-group input:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 25px;
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

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #f5c6cb;
}
</style>
