<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  modelValue: string
  error?: string
  multiline?: boolean
  visuallyHideLabel?: boolean
}>(), {
  error: '',
  multiline: false,
  visuallyHideLabel: false
})

const emit = defineEmits<{
  blur: []
  'update:modelValue': [value: string]
}>()

defineOptions({ inheritAttrs: false })

const errorId = computed(() => `${props.id}-error`)

function onInput(event: Event): void {
  const target = event.target

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div class="field">
    <label
      class="field__label"
      :class="{ 'field__label--hidden': visuallyHideLabel }"
      :for="id"
    >
      {{ label }}
    </label>
    <component
      :is="multiline ? 'textarea' : 'input'"
      :id="id"
      v-bind="$attrs"
      class="field__control"
      :class="{
        'field__control--invalid': error,
        'field__control--multiline': multiline
      }"
      :type="multiline ? undefined : 'text'"
      :value="modelValue"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
      @blur="emit('blur')"
    />
    <p v-if="error" :id="errorId" class="field__error">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;
@use '~/assets/scss/mixins' as *;

.field {
  display: grid;
  gap: 0.375rem;
}

.field__label {
  color: $color-text;
  font-weight: 600;
}

.field__label--hidden {
  @include visually-hidden;
}

.field__control {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid $color-border-strong;
  border-radius: $radius-small;
  background-color: $color-surface;
  color: $color-text;
  line-height: 1.35;

  &:hover {
    border-color: $color-text-muted;
  }

  &:focus-visible {
    @include focus-ring;

    border-color: $color-accent;
  }
}

.field__control--multiline {
  min-height: 3rem;
  resize: vertical;
}

.field__control--invalid {
  border-color: $color-danger;
}

.field__error {
  margin: 0;
  color: $color-danger;
  font-size: 0.875rem;
}
</style>
