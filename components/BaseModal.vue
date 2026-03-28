<script setup lang="ts">
defineProps<{
  show: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-surface-950/40 backdrop-blur-md" 
          @click="$emit('close')"
        />

        <!-- Modal Content -->
        <Transition
          appear
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="relative w-full max-w-md glass-strong shadow-2xl overflow-hidden border border-white/20 dark:border-surface-700/50">
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.glass-strong {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
}

/* Use :global or just ensure the selector matches the teleported structure */
</style>

<style>
.dark .glass-strong {
  background: rgba(15, 23, 42, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
