<template>
  <div v-if="visible" class="app-message" :class="messageClass">
    <div class="message-icon">
      {{ icon }}
    </div>
    <div class="message-content">
      <p class="message-text">{{ text }}</p>
      <button v-if="dismissible" @click="hide" class="message-close">
        ×
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppMessage',
  props: {
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success', // success, error, warning, info
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 5000 // Auto-hide after 5 seconds
    }
  },
  data() {
    return {
      visible: true,
      timeout: null
    }
  },
  computed: {
    messageClass() {
      return `message-${this.type}`
    },
    icon() {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      return icons[this.type] || 'ℹ️'
    }
  },
  mounted() {
    if (this.duration > 0) {
      this.timeout = setTimeout(() => {
        this.hide()
      }, this.duration)
    }
  },
  beforeUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  },
  methods: {
    hide() {
      this.visible = false
      this.$emit('hide')
    }
  }
}
</script>

<style scoped>
.app-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.message-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.message-warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.message-info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.message-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.message-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.message-text {
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
}

.message-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
  padding: 0;
  line-height: 1;
  transition: opacity 0.2s ease;
}

.message-close:hover {
  opacity: 1;
}
</style>
