<script setup lang="ts">
import type { AiRecipeResponse } from '~/types'

useHead({
  title: 'AI Βοηθός Ψυγείου',
  meta: [
    { name: 'description', content: 'Βάλε τα υλικά που έχεις στο ψυγείο και ο AI σου βρίσκει τέλεια συνταγή!' },
  ],
})

const ingredientInput = ref('')
const ingredients = ref<string[]>([])
const isVegan = ref(false)
const loading = ref(false)
const result = ref<AiRecipeResponse | null>(null)
const error = ref<string | null>(null)

function addIngredient() {
  const trimmed = ingredientInput.value.trim()
  if (trimmed && !ingredients.value.includes(trimmed)) {
    ingredients.value.push(trimmed)
    ingredientInput.value = ''
  }
}

function removeIngredient(index: number) {
  ingredients.value.splice(index, 1)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addIngredient()
  }
}

async function generateRecipe() {
  if (ingredients.value.length === 0) {
    error.value = 'Πρόσθεσε τουλάχιστον ένα υλικό!'
    return
  }

  loading.value = true
  error.value = null
  result.value = null

  try {
    const data = await $fetch<AiRecipeResponse>('/api/ai/fridge-assistant', {
      method: 'POST',
      body: {
        ingredients: ingredients.value,
        isVegan: isVegan.value,
      },
    })

    result.value = data
  } catch (err: any) {
    error.value = err.data?.statusMessage || err.message || 'Κάτι πήγε στραβά. Δοκίμασε ξανά.'
  } finally {
    loading.value = false
  }
}

// Quick ingredient suggestions
const suggestions = ['Κοτόπουλο', 'Ντομάτα', 'Πατάτες', 'Κρεμμύδι', 'Σκόρδο', 'Φέτα', 'Μελιτζάνα', 'Κολοκυθάκι', 'Ρύζι', 'Μακαρόνια']
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-10">
      <span class="text-5xl animate-float inline-block" aria-hidden="true">🤖</span>
      <h1 class="mt-4 font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">
        AI Βοηθός Ψυγείου
      </h1>
      <p class="mt-2 text-surface-500 dark:text-surface-400">
        Πες μας τι έχεις στο ψυγείο και θα σου βρούμε τέλεια συνταγή!
      </p>
    </div>

    <div class="glass p-6 space-y-6">
      <!-- Ingredient input -->
      <div>
        <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          <span aria-hidden="true">🥕</span> Τα υλικά σου
        </label>
        <div class="flex gap-2">
          <input
            v-model="ingredientInput"
            @keydown="handleKeydown"
            type="text"
            class="input-field flex-1"
            placeholder="π.χ. κοτόπουλο, ντομάτα, φέτα..."
          />
          <button @click="addIngredient" type="button" class="btn-glow !px-4" aria-label="Προσθήκη υλικού">
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      <!-- Quick suggestions -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          @click="() => { if (!ingredients.includes(suggestion)) ingredients.push(suggestion) }"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
          :class="ingredients.includes(suggestion)
            ? 'bg-brand-500 text-white'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-brand-500/10 hover:text-brand-500'"
        >
          {{ suggestion }}
        </button>
      </div>

      <!-- Selected ingredients chips -->
      <div v-if="ingredients.length" class="flex flex-wrap gap-2">
        <span
          v-for="(ing, i) in ingredients"
          :key="i"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium animate-scale-in"
        >
          {{ ing }}
          <button @click="removeIngredient(i)" class="hover:text-red-500 transition-colors" aria-label="Αφαίρεση υλικού">
            <span aria-hidden="true">✕</span>
          </button>
        </span>
      </div>

      <!-- Vegan toggle -->
      <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors">
        <div
          class="relative w-12 h-6 rounded-full transition-colors duration-300"
          :class="isVegan ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'"
          @click="isVegan = !isVegan"
        >
          <div
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
            :class="isVegan ? 'translate-x-6' : 'translate-x-0.5'"
          />
        </div>
        <span class="text-sm font-semibold text-surface-700 dark:text-surface-300">
          <span aria-hidden="true">🌱</span> Μόνο Vegan
        </span>
      </label>

      <!-- Submit -->
      <button
        @click="generateRecipe"
        :disabled="loading || ingredients.length === 0"
        class="w-full btn-glow text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="inline-flex items-center gap-2">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Ο AI σκέφτεται...
        </span>
        <span v-else><span aria-hidden="true">🪄</span> Βρες μου Συνταγή!</span>
      </button>
    </div>

    <div v-if="error" class="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm animate-slide-down">
      <span aria-hidden="true">⚠️</span> {{ error }}
    </div>

    <!-- Results -->
    <div id="fridge-result" class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 mt-12">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-8 animate-fade-in">
        <div class="glass p-8 space-y-6">
          <div class="flex items-center gap-4">
            <Skeleton class-name="w-16 h-16 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class-name="h-6 w-3/4" />
              <Skeleton class-name="h-4 w-1/2" />
            </div>
          </div>
          <div class="space-y-3">
            <Skeleton class-name="h-4 w-full" />
            <Skeleton class-name="h-4 w-full" />
            <Skeleton class-name="h-4 w-2/3" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <Skeleton class-name="h-24 rounded-2xl" />
            <Skeleton class-name="h-24 rounded-2xl" />
          </div>
        </div>
      </div>

      <AiRecipeResult
        v-if="result"
        :recipe="result"
      />
    </div>
  </div>
</template>
