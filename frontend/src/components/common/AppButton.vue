<template>
  <button
    class="app-button"
    :class="buttonClass"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="button-loading">
      <div class="spinner"></div>
      <span>{{ loadingText }}</span>
    </span>
    <span v-else class="button-content">
      <span v-if="icon" class="button-icon">{{ icon }}</span>
      <span class="button-text">
        <slot>{{ text }}</slot>
      </span>
    </span>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    variant: {
      type: String,
      default: 'primary', // primary, secondary, danger, success, warning, info
      validator: (value) => ['primary', 'secondary', 'danger', 'success', 'warning', 'info'].includes(value)
    },
    size: {
      type: String,
      default: 'normal', // small, normal, large
      validator: (value) => ['small', 'normal', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    },
    icon: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    block: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClass() {
      return [
        `btn-${this.variant}`,
        `btn-${this.size}`,
        {
          'btn-block': this.block,
          'btn-rounded': this.rounded,
          'btn-loading': this.loading
        }
      ]
    }
  },
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.app-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Sizes */
.btn-small {
  padding: 8px 16px;
  font-size: 12px;
}

.btn-normal {
  padding: 12px 24px;
  font-size: 14px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 16px;
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, #3d7d73 0%, #4b7d75 100%);
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
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-info {
  background: linear-gradient(135deg, #96bbf7 0%, #6982b7 100%);
  color: white;
}

.btn-info:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Modifiers */
.btn-block {
  width: 100%;
  display: flex;
}

.btn-rounded {
  border-radius: 50px;
}

/* Loading State */
.button-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-icon {
  font-size: 18px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Secondary button spinner color */
.btn-secondary .spinner {
  border-color: rgba(95, 99, 104, 0.3);
  border-top-color: #5f6368;
}
</style>
