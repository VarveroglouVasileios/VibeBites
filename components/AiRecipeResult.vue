<script setup lang="ts">
import type { AiRecipeResponse } from '~/types'

const props = defineProps<{
  recipe: AiRecipeResponse
}>()

const totalMacros = computed(() => {
  const { calories, protein, carbs, fat } = props.recipe.macros
  return { calories, protein, carbs, fat }
})

const macroColors = {
  protein: 'from-blue-500 to-cyan-500',
  carbs: 'from-amber-500 to-yellow-500',
  fat: 'from-rose-500 to-pink-500',
}
</script>

<template>
  <div class="glass p-6 space-y-6 animate-scale-in">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span v-if="recipe.is_vegan" class="badge-success">🌱 Vegan</span>
          <span class="badge-brand">🤖 AI Generated</span>
        </div>
        <h3 class="font-display text-2xl font-bold text-surface-900 dark:text-white">
          {{ recipe.title }}
        </h3>
        <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {{ recipe.description }}
        </p>
      </div>
    </div>

    <!-- Macros -->
    <div class="grid grid-cols-4 gap-3">
      <div class="text-center p-3 rounded-xl bg-brand-500/10 dark:bg-brand-500/5">
        <p class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ totalMacros.calories }}</p>
        <p class="text-xs text-surface-500 mt-0.5">Calories</p>
      </div>
      <div class="text-center p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/5">
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalMacros.protein }}g</p>
        <p class="text-xs text-surface-500 mt-0.5">Protein</p>
      </div>
      <div class="text-center p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/5">
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ totalMacros.carbs }}g</p>
        <p class="text-xs text-surface-500 mt-0.5">Carbs</p>
      </div>
      <div class="text-center p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/5">
        <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">{{ totalMacros.fat }}g</p>
        <p class="text-xs text-surface-500 mt-0.5">Fat</p>
      </div>
    </div>

    <!-- Macro bars -->
    <div class="space-y-2">
      <div v-for="(value, key) in { protein: totalMacros.protein, carbs: totalMacros.carbs, fat: totalMacros.fat }" :key="key" class="flex items-center gap-3">
        <span class="w-16 text-xs text-surface-500 capitalize">{{ key }}</span>
        <div class="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out"
            :class="macroColors[key as keyof typeof macroColors]"
            :style="{ width: `${Math.min((value / totalMacros.calories) * 400, 100)}%` }"
          />
        </div>
        <span class="text-xs font-medium text-surface-600 dark:text-surface-400 w-10 text-right">{{ value }}g</span>
      </div>
    </div>

    <!-- Ingredients -->
    <div>
      <h4 class="font-display font-semibold text-surface-900 dark:text-white mb-3">🧾 Υλικά</h4>
      <ul class="space-y-2">
        <li
          v-for="(ing, i) in recipe.ingredients"
          :key="i"
          class="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
          <span class="font-medium">{{ ing.quantity }} {{ ing.unit }}</span>
          {{ ing.name }}
        </li>
      </ul>
    </div>

    <!-- Instructions -->
    <div>
      <h4 class="font-display font-semibold text-surface-900 dark:text-white mb-3">📝 Οδηγίες</h4>
      <ol class="space-y-3">
        <li
          v-for="(step, i) in recipe.instructions"
          :key="i"
          class="flex gap-3 text-sm"
        >
          <span class="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white text-xs font-bold flex items-center justify-center">
            {{ i + 1 }}
          </span>
          <span class="text-surface-700 dark:text-surface-300 pt-1">{{ step }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>
