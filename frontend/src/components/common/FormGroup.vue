<template>
  <div class="form-group" :class="{ 'form-group-error': error }">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="required-star">*</span>
    </label>
    
    <div class="form-input-wrapper">
      <slot></slot>
    </div>
    
    <div v-if="error" class="form-error">
      {{ error }}
    </div>
    
    <div v-if="hint" class="form-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormGroup',
  props: {
    label: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    inputId: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-star {
  color: #ef4444;
  font-weight: 600;
}

.form-input-wrapper {
  position: relative;
}

.form-error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  font-weight: 500;
}

.form-hint {
  font-size: 12px;
  color: #5f6368;
  margin-top: 4px;
  font-style: italic;
}

.form-group-error .form-input-wrapper :deep(input),
.form-group-error .form-input-wrapper :deep(select),
.form-group-error .form-input-wrapper :deep(textarea) {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
</style>
