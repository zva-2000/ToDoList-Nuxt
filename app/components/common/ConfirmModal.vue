<script setup lang="ts">
import { AppButton, 
  AppModal } from '~/components/common'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
}>(), {
  cancelLabel: 'Отмена',
  confirmLabel: 'Удалить'
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
        variant="danger"
        @click="onConfirm"
      >
        {{ confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>
