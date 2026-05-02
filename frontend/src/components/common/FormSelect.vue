<template>
  <select
    :id="inputId"
    :value="modelValue"
    :disabled="disabled"
    class="form-select"
    :class="selectClass"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <option v-if="placeholder" value="" disabled selected>
      {{ placeholder }}
    </option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'FormSelect',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      required: true,
      validator: (options) => {
        return options.every(option => 
          typeof option === 'object' && 
          'value' in option && 
          'label' in option
        )
      }
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
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
    }
  },
  computed: {
    selectClass() {
      return [
        `select-${this.size}`,
        `select-${this.variant}`
      ]
    }
  },
  methods: {
    handleChange(event) {
      this.$emit('update:modelValue', event.target.value)
      this.$emit('change', event)
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
.form-select {
  padding: 12px 16px;
  border: 2px solid #e8eaed;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #3d7d73;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.form-select:disabled {
  background: #f8f9fa;
  color: #5f6368;
  cursor: not-allowed;
}

/* Sizes */
.select-small {
  padding: 8px 12px;
  font-size: 12px;
}

.select-normal {
  padding: 12px 16px;
  font-size: 14px;
}

.select-large {
  padding: 16px 20px;
  font-size: 16px;
}

/* Variants */
.select-default {
  border: 2px solid #e8eaed;
  background: white;
}

.select-outlined {
  border: 2px solid #e8eaed;
  background: white;
}

.select-outlined:focus {
  border-color: #3d7d73;
}

.select-filled {
  border: 2px solid transparent;
  background: #f8f9fa;
}

.select-filled:focus {
  border-color: #3d7d73;
  background: white;
}
</style>
