<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <BaseModal :show="show" @close="$emit('cancel')">
    <div class="p-6">
      <div class="flex items-center gap-4 mb-4">
        <div 
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
          :class="{
            'bg-red-500/10 text-red-500': variant === 'danger',
            'bg-amber-500/10 text-amber-500': variant === 'warning',
            'bg-brand-500/10 text-brand-500': variant === 'info' || !variant
          }"
        >
          <span v-if="variant === 'danger'" aria-hidden="true">🗑️</span>
          <span v-else-if="variant === 'warning'" aria-hidden="true">⚠️</span>
          <span v-else aria-hidden="true">💡</span>
        </div>
        <div>
          <h3 class="text-xl font-display font-bold text-surface-900 dark:text-white">
            {{ title }}
          </h3>
        </div>
      </div>

      <p class="text-surface-600 dark:text-surface-400 mb-8 leading-relaxed">
        {{ message }}
      </p>

      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          class="btn-secondary w-full sm:w-auto order-2 sm:order-1"
          @click="$emit('cancel')"
          :disabled="loading"
        >
          {{ cancelText || 'Ακύρωση' }}
        </button>
        <button
          type="button"
          class="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{
            'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20': variant === 'danger',
            'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20': variant === 'warning',
            'bg-brand-500 text-white hover:bg-brand-600': variant === 'info' || !variant
          }"
          @click="$emit('confirm')"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin text-lg" aria-hidden="true">⏳</span>
          <span>{{ confirmText || 'Επιβεβαίωση' }}</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>
