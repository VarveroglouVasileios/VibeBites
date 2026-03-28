<script setup lang="ts">
import type { FridgeRecipe } from '~/types/fridge-recipe'

const props = withDefaults(
  defineProps<{
    recipe: FridgeRecipe
    loading?: boolean
    /** Requires Supabase signed-in user */
    canSave?: boolean
  }>(),
  { canSave: true },
)

const emit = defineEmits<{
  save: [recipe: FridgeRecipe]
  share: [recipe: FridgeRecipe]
}>()
</script>

<template>
  <div class="overflow-hidden rounded-[2.5rem] bg-surface-container-lowest shadow-ambient">
    <div class="grid grid-cols-1 lg:grid-cols-12">
      <!-- Main Content -->
      <div class="p-8 lg:col-span-8 md:p-12">
        <div class="mb-6 flex flex-wrap gap-2">
          <span class="flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
            <span class="material-symbols-outlined text-sm">auto_awesome</span> AI Curated
          </span>
          <span class="rounded-full bg-surface-container px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface">
            New Recipe
          </span>
        </div>

        <h2 class="mb-8 font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
          {{ recipe.title }}
        </h2>

        <p class="mb-8 text-lg text-on-surface-variant">
          {{ recipe.description }}
        </p>

        <div class="grid gap-12 md:grid-cols-2">
          <!-- Ingredients -->
          <div>
            <h3 class="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Ingredients
            </h3>
            <ul class="space-y-3">
              <li
                v-for="(ing, idx) in recipe.ingredients"
                :key="idx"
                class="flex items-center gap-3 rounded-xl bg-surface-container-low p-3 font-body text-on-surface-variant"
              >
                <span class="material-symbols-outlined text-sm text-primary">check_circle</span>
                {{ ing.amount }} {{ ing.unit }} {{ ing.name }}
              </li>
            </ul>
          </div>

          <!-- Preparation -->
          <div>
            <h3 class="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Preparation
            </h3>
            <div class="space-y-6">
              <div class="flex gap-4">
                <p class="whitespace-pre-wrap font-body leading-relaxed text-on-surface-variant">
                  {{ recipe.instructions }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: Macros & Actions -->
      <div class="bg-surface-container-low p-8 lg:col-span-4 md:p-12">
        <div class="mb-8 rounded-[2rem] bg-surface-container-high p-6 shadow-sm">
          <div class="mb-6 flex items-center gap-3">
            <span
              class="material-symbols-outlined text-secondary"
              style="font-variation-settings: 'FILL' 1;"
            >analytics</span>
            <h3 class="font-headline text-lg font-bold text-on-surface">
              AI Macros
            </h3>
          </div>

          <div class="mb-8 space-y-4">
            <div class="flex items-end justify-between border-b border-outline-variant/30 pb-2">
              <span class="font-label text-sm text-on-surface-variant">Calories</span>
              <span class="font-headline text-xl font-bold text-on-surface">{{ recipe.macros.calories }} kcal</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="rounded-2xl bg-surface-container-lowest p-3">
                <span class="mb-1 block text-[10px] font-bold uppercase text-primary">Protein</span>
                <span class="text-lg font-black text-on-surface">{{ recipe.macros.protein_g }}g</span>
              </div>
              <div class="rounded-2xl bg-surface-container-lowest p-3">
                <span class="mb-1 block text-[10px] font-bold uppercase text-secondary">Carbs</span>
                <span class="text-lg font-black text-on-surface">{{ recipe.macros.carbs_g }}g</span>
              </div>
              <div class="rounded-2xl bg-surface-container-lowest p-3">
                <span class="mb-1 block text-[10px] font-bold uppercase text-tertiary">Fats</span>
                <span class="text-lg font-black text-on-surface">{{ recipe.macros.fat_g }}g</span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-primary-fixed-dim/10 p-4">
            <p class="text-xs italic leading-relaxed text-on-primary-fixed-variant">
              "This AI-curated recipe is optimized for the ingredients you have on hand."
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button
            class="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            :disabled="loading || !props.canSave"
            @click="emit('save', recipe)"
          >
            <span class="material-symbols-outlined">{{ loading ? 'sync' : 'bookmark' }}</span>
            {{
              loading
                ? 'Saving...'
                : props.canSave
                  ? 'Save to My Recipes'
                  : 'Sign in to save'
            }}
          </button>
          <button
            class="flex items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest py-4 font-bold text-on-surface shadow-sm transition-all hover:bg-surface-container-low active:scale-95"
            @click="emit('share', recipe)"
          >
            <span class="material-symbols-outlined">share</span> Share
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
