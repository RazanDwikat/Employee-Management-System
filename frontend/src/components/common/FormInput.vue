<template>
  <input
    :id="inputId"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :min="min"
    :max="max"
    :step="step"
    class="form-input"
    :class="inputClass"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>

<script>
export default {
  name: 'FormInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'normal', // small, normal, large
      validator: (value) => ['small', 'normal', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'default', // default, outlined, filled
      validator: (value) => ['default', 'outlined', 'filled'].includes(value)
    },
    inputId: {
      type: String,
      default: ''
    },
    min: {
      type: [String, Number],
      default: null
    },
    max: {
      type: [String, Number],
      default: null
    },
    step: {
      type: [String, Number],
      default: null
    }
  },
  computed: {
    inputClass() {
      return [
        `input-${this.size}`,
        `input-${this.variant}`
      ]
    }
  },
  methods: {
    handleInput(event) {
      this.$emit('update:modelValue', event.target.value)
      this.$emit('input', event)
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    }
  }
}
</script>

<style scoped>
.form-input {
  padding: 12px 16px;
  border: 2px solid #e8eaed;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.form-input::placeholder {
  color: #9aa0a6;
}

.form-input:disabled {
  background: #f8f9fa;
  color: #5f6368;
  cursor: not-allowed;
}

.form-input:readonly {
  background: #f8f9fa;
  color: #5f6368;
}

/* Sizes */
.input-small {
  padding: 8px 12px;
  font-size: 12px;
}

.input-normal {
  padding: 12px 16px;
  font-size: 14px;
}

.input-large {
  padding: 16px 20px;
  font-size: 16px;
}

/* Variants */
.input-default {
  border: 2px solid #e8eaed;
  background: white;
}

.input-outlined {
  border: 2px solid #e8eaed;
  background: white;
}

.input-outlined:focus {
  border-color: #1a73e8;
}

.input-filled {
  border: 2px solid transparent;
  background: #f8f9fa;
}

.input-filled:focus {
  border-color: #1a73e8;
  background: white;
}
</style>
