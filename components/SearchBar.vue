<script setup lang="ts">
const emit = defineEmits<{
  search: [query: string]
}>()

const query = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', query.value)
  }, 350)
}

function handleSubmit() {
  clearTimeout(debounceTimer)
  emit('search', query.value)
}

function clear() {
  query.value = ''
  emit('search', '')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="relative group">
    <!-- Search icon -->
    <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        class="w-5 h-5 text-surface-400 group-focus-within:text-brand-500 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Input -->
    <input
      v-model="query"
      @input="handleInput"
      type="search"
      placeholder="Αναζήτησε συνταγές... (π.χ. μουσακάς, σαλάτα)"
      class="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-200 text-sm shadow-sm focus:shadow-glow"
    />

    <!-- Clear button -->
    <button
      v-if="query"
      type="button"
      @click="clear"
      class="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
    >
      <svg class="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </form>
</template>
