<script setup lang="ts">
const { isActive, isSupported, toggle } = useWakeLock()
</script>

<template>
  <button
    v-if="isSupported"
    @click="toggle"
    class="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300"
    :class="isActive
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 animate-pulse-glow'
      : 'glass hover:shadow-glow text-surface-700 dark:text-surface-300'"
  >
    <!-- Icon -->
    <span class="text-lg transition-transform duration-300" :class="isActive ? 'animate-bounce-subtle' : ''">
      {{ isActive ? '👩‍🍳' : '👩‍🍳' }}
    </span>

    <!-- Label -->
    <span>{{ isActive ? 'Cooking Mode ON' : 'Cooking Mode' }}</span>

    <!-- Active indicator dot -->
    <span
      v-if="isActive"
      class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping"
    />
    <span
      v-if="isActive"
      class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400"
    />
  </button>
</template>
