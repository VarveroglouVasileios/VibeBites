<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<template>
  <div :class="['animate-pulse bg-surface-200 dark:bg-surface-700 rounded', className]" />
</template>
