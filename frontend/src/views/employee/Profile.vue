<template>
  <div class="employee-profile">
    <!-- Page Header -->
    <PageHeader 
      title="My Profile" 
      subtitle="Manage your personal information" 
    />
    
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Loading profile..." />
    
    <!-- Profile Content -->
    <div v-else class="profile-content">
      <!-- User Info Card -->
      <BaseCard variant="default" hoverable class="user-info-card">
        <div class="user-info-content">
          <div class="user-avatar">
            <div class="avatar-circle">
              {{ getInitials(user.name) }}
            </div>
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ user.name }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <p class="user-role">{{ user.role }}</p>
          </div>
        </div>
      </BaseCard>
      
      <!-- Profile Form -->
      <BaseCard variant="default" class="profile-form-card">
        <template #header>
          <h3 class="form-title">Update Profile Information</h3>
        </template>
        
        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="form-grid">
            <FormGroup label="Full Name" :required="true">
              <FormInput
                v-model="profileForm.name"
                type="text"
                placeholder="Enter your full name"
                id="name"
              />
            </FormGroup>
            
            <FormGroup label="Email Address" :required="true">
              <FormInput
                v-model="profileForm.email"
                type="email"
                placeholder="Enter your email"
                id="email"
              />
            </FormGroup>
            
            <FormGroup label="Phone Number">
              <FormInput
                v-model="profileForm.phone"
                type="tel"
                placeholder="Enter your phone number"
                id="phone"
              />
            </FormGroup>
            
            <FormGroup label="Address">
              <FormInput
                v-model="profileForm.address"
                type="text"
                placeholder="Enter your address"
                id="address"
              />
            </FormGroup>
          </div>
          
          <!-- Password Section -->
          <div class="password-section">
            <h4 class="section-subtitle">Change Password</h4>
            <div class="form-grid">
              <FormGroup label="Current Password">
                <FormInput
                  v-model="profileForm.current_password"
                  type="password"
                  placeholder="Enter current password"
                  id="current_password"
                />
              </FormGroup>
              
              <FormGroup label="New Password">
                <FormInput
                  v-model="profileForm.password"
                  type="password"
                  placeholder="Enter new password"
                  id="password"
                />
              </FormGroup>
              
              <FormGroup label="Confirm New Password">
                <FormInput
                  v-model="profileForm.password_confirmation"
                  type="password"
                  placeholder="Confirm new password"
                  id="password_confirmation"
                />
              </FormGroup>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="form-actions">
            <AppButton
              type="submit"
              variant="primary"
              :loading="submitting"
              :disabled="submitting"
            >
              Update Profile
            </AppButton>
            
            <AppButton
              type="button"
              variant="secondary"
              @click="handleReset"
              :disabled="submitting"
            >
              Reset
            </AppButton>
          </div>
        </form>
      </BaseCard>
      
      <!-- Success/Error Messages -->
      <AppMessage
        v-if="message"
        :type="messageType"
        :text="message"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import employeeService from '../../services/employeeService'
import BaseCard from '../../components/common/BaseCard.vue'
import PageHeader from '../../components/common/PageHeader.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'
import FormGroup from '../../components/common/FormGroup.vue'
import FormInput from '../../components/common/FormInput.vue'
import AppButton from '../../components/common/AppButton.vue'
import AppMessage from '../../components/common/AppMessage.vue'

export default {
  name: 'EmployeeProfile',
  components: {
    BaseCard,
    PageHeader,
    LoadingSpinner,
    FormGroup,
    FormInput,
    AppButton,
    AppMessage
  },
  setup() {
    const authStore = useAuthStore()
    
    // Reactive data
    const loading = ref(false)
    const submitting = ref(false)
    const message = ref('')
    const messageType = ref('success')
    
    const user = ref({})
    const profileForm = ref({
      name: '',
      email: '',
      phone: '',
      address: '',
      current_password: '',
      password: '',
      password_confirmation: ''
    })
    
    // Methods
    const loadProfile = async () => {
      try {
        loading.value = true
        
        // Get full profile data from API
        const response = await employeeService.getProfile()
        user.value = response.user
        
        // Initialize form with user data (including employee data)
        profileForm.value = {
          name: user.value.name || '',
          email: user.value.email || '',
          phone: user.value.employee?.phone || '',
          address: user.value.employee?.address || '',
          current_password: '',
          password: '',
          password_confirmation: ''
        }
        
      } catch (error) {
        console.error('Error loading profile:', error)
        showMessage('Error loading profile', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const handleUpdateProfile = async () => {
      try {
        submitting.value = true
        
        // Validate password fields if password is being changed
        if (profileForm.value.password) {
          if (profileForm.value.password !== profileForm.value.password_confirmation) {
            showMessage('Passwords do not match', 'error')
            return
          }
          
          if (!profileForm.value.current_password) {
            showMessage('Current password is required to change password', 'error')
            return
          }
        }
        
        // Prepare update data
        const updateData = {
          name: profileForm.value.name,
          email: profileForm.value.email,
          phone: profileForm.value.phone,
          address: profileForm.value.address
        }
        
        // Add password fields only if password is being changed
        if (profileForm.value.password) {
          updateData.password = profileForm.value.password
          updateData.current_password = profileForm.value.current_password
        }
        
        // Update profile
        const response = await employeeService.updateProfile(updateData)
        
        // Update auth store with new user data
        if (response.user) {
          authStore.setUser(response.user)
          user.value = response.user
          
          // Update form with new data
          profileForm.value = {
            name: user.value.name || '',
            email: user.value.email || '',
            phone: user.value.employee?.phone || '',
            address: user.value.employee?.address || '',
            current_password: '',
            password: '',
            password_confirmation: ''
          }
        }
        
        // Clear password fields
        profileForm.value.current_password = ''
        profileForm.value.password = ''
        profileForm.value.password_confirmation = ''
        
        showMessage('Profile updated successfully!', 'success')
        
      } catch (error) {
        console.error('Error updating profile:', error)
        showMessage(error.response?.data?.message || 'Error updating profile', 'error')
      } finally {
        submitting.value = false
      }
    }
    
    const handleReset = () => {
      loadProfile()
      message.value = ''
    }
    
    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }
    
    const getInitials = (name) => {
      if (!name) return 'U'
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    // Lifecycle
    onMounted(() => {
      loadProfile()
    })
    
    return {
      loading,
      submitting,
      message,
      messageType,
      user,
      profileForm,
      handleUpdateProfile,
      handleReset,
      getInitials
    }
  }
}
</script>

<style scoped>
.employee-profile {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #5f6368;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e8eaed;
  border-top: 4px solid #3d7d73;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* User Info Card */
.user-info-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #678782 0%, #6a8480 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.user-email {
  font-size: 16px;
  color: #5f6368;
  margin: 0 0 4px 0;
}

.user-role {
  font-size: 14px;
  color: #3d7d73;
  font-weight: 500;
  text-transform: capitalize;
  margin: 0;
}

/* Profile Form Card */
.profile-form-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px 0;
}

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 32px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8eaed;
}

/* Form Styles */
.profile-form {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e8eaed;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #3d7d73;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.form-input::placeholder {
  color: #9aa0a6;
}

/* Password Section */
.password-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e8eaed;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e8eaed;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3d7d73 0%, #4d7b74 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
}

.btn-secondary {
  background: white;
  color: #5f6368;
  border: 2px solid #e8eaed;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #dadce0;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Messages */
.message {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .employee-profile {
    padding: 16px;
  }
  
  .user-info-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .profile-form-card {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
