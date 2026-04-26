<template>
  <div v-if="modelValue" class="modal" @click="handleBackdropClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button 
          v-if="showCloseButton" 
          @click="closeModal" 
          class="close-btn"
          :disabled="loading"
        >
          ×
        </button>
      </div>
      
      <div class="modal-body">
        <slot name="body">
          <!-- Default content -->
          <p>{{ content }}</p>
        </slot>
      </div>
      
      <div v-if="showFooter" class="modal-footer">
        <slot name="footer">
          <button 
            @click="handleSave" 
            class="save-btn"
            :disabled="loading || saveDisabled"
          >
            {{ loading ? loadingText : saveText }}
          </button>
          <button 
            @click="handleCancel" 
            class="cancel-btn"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    },
    saveText: {
      type: String,
      default: 'Save'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    saveDisabled: {
      type: Boolean,
      default: false
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'save', 'cancel', 'close'],
  methods: {
    closeModal() {
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },
    
    handleSave() {
      this.$emit('save')
    },
    
    handleCancel() {
      this.$emit('cancel')
      this.closeModal()
    },
    
    handleBackdropClick() {
      if (this.closeOnBackdrop) {
        this.closeModal()
      }
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #f1f3f4;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 30px 0 30px;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: #6c757d;
  font-weight: 500;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover:not(:disabled) {
  background: #f8f9fa;
  color: #495057;
}

.close-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-body {
  padding: 0 30px 20px 30px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 30px 30px 30px;
  justify-content: flex-end;
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
  transform: none;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-1px);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
