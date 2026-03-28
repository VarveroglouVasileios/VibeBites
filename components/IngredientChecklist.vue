<script setup lang="ts">
import type { Ingredient as BaseIngredient } from '~/types'

interface Ingredient extends Omit<BaseIngredient, 'sort_order'> {
  sort_order: number | null
}

const props = defineProps<{
  ingredients: Ingredient[]
  recipeId?: string
  targetServings?: number
  originalServings?: number
}>()

const isGroceryMode = ref(false)
const checked = ref<Set<string>>(new Set())

// Persistence key
const STORAGE_KEY = computed(() => props.recipeId ? `vibebites-checklist-${props.recipeId}` : null)

onMounted(() => {
  if (STORAGE_KEY.value) {
    const saved = sessionStorage.getItem(STORAGE_KEY.value)
    if (saved) {
      try {
        const ids = JSON.parse(saved)
        checked.value = new Set(ids)
      } catch (e) {}
    }
  }
})

const scalingFactor = computed(() => {
  if (!props.targetServings || !props.originalServings) return 1
  return props.targetServings / props.originalServings
})

function formatQuantity(quantity: string | null) {
  if (!quantity) return null
  const num = parseFloat(quantity)
  if (isNaN(num)) return quantity
  const scaled = num * scalingFactor.value
  return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1)
}

const categories: Record<string, string[]> = {
  'Προϊόντα': ['ντομάτα', 'κρεμμύδι', 'σκόρδο', 'πατάτα', 'σπανάκι', 'αγγούρι', 'μαϊντανός', 'άνηθος', 'λεμόνι', 'καρότο', 'κολοκυθάκι', 'μελιτζάνα', 'πιπεριά'],
  'Πρωτεΐνη': ['κοτόπουλο', 'μοσχάρι', 'κιμάς', 'ψάρι', 'σολομός', 'αυγό', 'ρεβίθια', 'φακές', 'φασόλια', 'τόφου'],
  'Γαλακτοκομικά': ['γάλα', 'φέτα', 'τυρί', 'γιαούρτι', 'κρέμα', 'βούτυρο'],
  'Ντουλάπι': ['λάδι', 'ελαιόλαδο', 'αλάτι', 'πιπέρι', 'ζάχαρη', 'αλεύρι', 'ρύζι', 'μακαρόνια', 'ζυμαρικά', 'ξύδι', 'ρίγανη', 'ταχίνι', 'μέλι'],
}

function getCategory(name: string) {
  const lowerName = name.toLowerCase()
  for (const [cat, items] of Object.entries(categories)) {
    if (items.some(item => lowerName.includes(item))) return cat
  }
  return 'Άλλα'
}

const categorizedIngredients = computed(() => {
  const groups: Record<string, Ingredient[]> = {}
  props.ingredients.forEach(ing => {
    const cat = getCategory(ing.name)
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(ing)
  })
  return groups
})

function toggle(id: string) {
  if (checked.value.has(id)) {
    checked.value.delete(id)
  } else {
    checked.value.add(id)
  }
  // Force reactivity
  checked.value = new Set(checked.value)
  
  // Persist
  if (STORAGE_KEY.value) {
    sessionStorage.setItem(STORAGE_KEY.value, JSON.stringify(Array.from(checked.value)))
  }
}

const progress = computed(() => {
  if (!props.ingredients.length) return 0
  return Math.round((checked.value.size / props.ingredients.length) * 100)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header with Toggles -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <button
        @click="isGroceryMode = !isGroceryMode"
        class="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full transition-all border border-transparent"
        :class="isGroceryMode ? 'bg-brand-500 text-white shadow-glow' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700'"
      >
        Grocery Mode {{ isGroceryMode ? 'ON' : 'OFF' }}
      </button>
    </div>

    <!-- Categorized List (Grocery Mode) -->
    <template v-if="isGroceryMode">
      <div v-for="(ings, cat) in categorizedIngredients" :key="cat" class="space-y-2">
        <h3 class="text-[11px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 px-3">{{ cat }}</h3>
        <label
          v-for="ingredient in ings"
          :key="ingredient.id"
          class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-surface-50 dark:hover:bg-surface-800/50"
          :class="checked.has(ingredient.id) ? 'opacity-60' : ''"
        >
          <!-- Checkbox -->
          <div
            class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            :class="checked.has(ingredient.id)
              ? 'bg-brand-500 border-brand-500'
              : 'border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900'"
            @click.prevent="toggle(ingredient.id)"
          >
            <svg v-if="checked.has(ingredient.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="flex-1 text-sm dark:text-surface-300" :class="checked.has(ingredient.id) ? 'line-through text-surface-400 dark:text-surface-500' : ''">
            <span v-if="ingredient.quantity" class="font-semibold text-surface-900 dark:text-white">{{ formatQuantity(ingredient.quantity) }}</span>
            <span v-if="ingredient.unit" class="text-surface-500 dark:text-surface-400 text-xs"> {{ ingredient.unit }}</span>
            {{ ingredient.name }}
          </span>
        </label>
      </div>
    </template>

    <!-- Simple List (Default) -->
    <template v-else>
      <label
        v-for="ingredient in ingredients"
        :key="ingredient.id"
        class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-surface-50 dark:hover:bg-surface-800/50"
        :class="checked.has(ingredient.id) ? 'opacity-60' : ''"
      >
        <!-- Checkbox -->
        <div
          class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
          :class="checked.has(ingredient.id)
            ? 'bg-brand-500 border-brand-500'
            : 'border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900'"
          @click.prevent="toggle(ingredient.id)"
        >
          <svg v-if="checked.has(ingredient.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span class="flex-1 text-sm dark:text-surface-300" :class="checked.has(ingredient.id) ? 'line-through text-surface-400 dark:text-surface-500' : ''">
          <span v-if="ingredient.quantity" class="font-semibold text-surface-900 dark:text-white">{{ formatQuantity(ingredient.quantity) }}</span>
          <span v-if="ingredient.unit" class="text-surface-500 dark:text-surface-400 text-xs"> {{ ingredient.unit }}</span>
          {{ ingredient.name }}
        </span>
      </label>
    </template>

    <!-- All done message -->
    <div
      v-if="progress === 100 && ingredients.length > 0"
      class="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center animate-scale-in"
    >
      <span class="text-2xl" aria-hidden="true">🎉</span>
      <p class="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        Όλα τα υλικά είναι έτοιμα! Ώρα για μαγειρική!
      </p>
    </div>
  </div>
</template>
