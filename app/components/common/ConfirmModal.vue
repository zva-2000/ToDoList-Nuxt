<script setup lang="ts">
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'

withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
}>(), {
  cancelLabel: 'Отмена',
  confirmLabel: 'Удалить',
  confirmVariant: 'danger'
})

const emit = defineEmits<{
  cancel: []
  confirm: []
  'update:modelValue': [value: boolean]
}>()

function onDismiss(): void {
  emit('cancel')
  emit('update:modelValue', false)
}

function onConfirm(): void {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="title"
    :description="description"
    :close-on-backdrop="false"
    @update:model-value="emit('update:modelValue', $event)"
    @close="onDismiss"
  >
    <template #footer>
      <AppButton
        variant="secondary"
        data-initial-focus
        @click="onDismiss"
      >
        {{ cancelLabel }}
      </AppButton>
      <AppButton
        :variant="confirmVariant"
        @click="onConfirm"
      >
        {{ confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>
