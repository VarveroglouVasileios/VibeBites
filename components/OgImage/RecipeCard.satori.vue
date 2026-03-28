<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  image?: string
}>()
</script>

<template>
  <div class="w-full h-full bg-white flex flex-col items-center justify-center p-12 relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
    <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />

    <div class="flex flex-row w-full h-full gap-8 items-center">
      <!-- Image -->
      <div v-if="image" class="w-1/2 h-full rounded-[2rem] overflow-hidden shadow-2xl">
        <img :src="image" class="w-full h-full object-cover" />
      </div>

      <!-- Content -->
      <div class="flex flex-col flex-1 justify-center">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-4xl">🍽️</span>
          <span class="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">VibeBites</span>
        </div>
        
        <h1 class="text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          {{ title }}
        </h1>
        
        <p class="text-2xl text-slate-500 line-clamp-3">
          {{ description }}
        </p>

        <div class="mt-8 flex items-center gap-4">
          <div class="px-6 py-2 bg-orange-500 text-white rounded-full text-xl font-bold">
            Δες τη συνταγή →
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
