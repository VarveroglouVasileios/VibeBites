<script setup lang="ts">
import { toast } from 'vue-sonner'
import { format, addDays, subDays, startOfWeek, isSameDay } from 'date-fns'
import { el } from 'date-fns/locale'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Εβδομαδιαίο Πλάνο - VibeBites' })

const mealStore = useMealPlannerStore()
const { mealPlans, loading, weeklyCalories } = storeToRefs(mealStore)

const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 })) // Monday start
const isGenerating = ref(false)
const targetCalories = ref(2000)
const showAiModal = ref(false)
const showAddModal = ref(false)

const customMealForm = reactive({
  date: new Date(),
  type: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
  title: '',
  description: '',
  calories: null as number | null
})

// Fetch on mount and when week changes
watch(currentWeekStart, (newDate) => {
  mealStore.fetchWeek(newDate)
}, { immediate: true })

const weekDays = computed(() => {
  return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart.value, i))
})

const mealTypes = [
  { id: 'breakfast', label: 'Πρωινό', icon: '🍳' },
  { id: 'lunch', label: 'Μεσημεριανό', icon: '🥗' },
  { id: 'snack', label: 'Σνακ', icon: '🍎' },
  { id: 'dinner', label: 'Βραδινό', icon: '🍝' },
]

function prevWeek() {
  currentWeekStart.value = subDays(currentWeekStart.value, 7)
}

function nextWeek() {
  currentWeekStart.value = addDays(currentWeekStart.value, 7)
}

// Get meal for specific day and type
function getMeal(date: Date, type: string) {
  return mealPlans.value.find(m => 
    m.meal_type === type && 
    isSameDay(new Date(m.date), date)
  )
}

function openAddModal(date: Date, type: string) {
  customMealForm.date = date
  customMealForm.type = type as any
  customMealForm.title = ''
  customMealForm.description = ''
  customMealForm.calories = null
  showAddModal.value = true
}

async function saveCustomMeal() {
  if (!customMealForm.title) return
  
  const success = await mealStore.addMeal({
    date: customMealForm.date.toISOString().split('T')[0],
    meal_type: customMealForm.type,
    custom_title: customMealForm.title,
    custom_description: customMealForm.description,
    calories: customMealForm.calories || undefined
  })

  if (success) {
    toast.success('Το γεύμα προστέθηκε!')
    showAddModal.value = false
  }
}

async function generateAiPlan() {
  isGenerating.value = true
  try {
    const res = await $fetch('/api/ai/meal-planner', {
      method: 'POST',
      body: { targetCalories: targetCalories.value, days: 7 }
    })

    if (Array.isArray(res)) {
      // res looks like: [ { dateOffset: 0, meals: [ { type: 'breakfast', title: '...', description: '...', calories: 300 } ] } ]
      for (const day of res) {
        const targetDate = addDays(currentWeekStart.value, day.dateOffset)
        const dateStr = targetDate.toISOString().split('T')[0]
        
        for (const m of day.meals) {
          await mealStore.addMeal({
            date: dateStr,
            meal_type: m.type,
            custom_title: m.title,
            custom_description: m.description,
            calories: m.calories
          })
        }
      }
      toast.success('Το AI πλάνο δημιουργήθηκε!')
      showAiModal.value = false
    }
  } catch (err: any) {
    toast.error('Αποτυχία: ' + err.message)
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="min-h-screen pb-20">
    <!-- Header -->
    <section class="bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5 py-8 border-b border-surface-200/50 dark:border-surface-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <span class="text-4xl" aria-hidden="true">📅</span>
            <div>
              <h1 class="font-display text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
                Εβδομαδιαίο Πλάνο
              </h1>
              <p class="text-surface-500 dark:text-surface-400 text-sm mt-1">
                Οργάνωσε τα γεύματά σου. Τρέχων στόχος: <strong class="text-brand-500">{{ targetCalories }}kcal</strong>/ημέρα.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button @click="showAiModal = true" class="btn-glow text-sm flex items-center gap-2 !px-4 !py-2.5">
              <span aria-hidden="true">🤖</span> AI Πρόταση Πλάνου
            </button>
          </div>
        </div>

        <!-- Weekly Nav & Stats -->
        <div class="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-4 rounded-2xl">
          <div class="flex items-center gap-4">
            <button @click="prevWeek" class="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <span class="material-symbols-outlined text-surface-600 dark:text-surface-400">chevron_left</span>
            </button>
            <div class="text-center min-w-[200px]">
              <div class="font-bold text-surface-900 dark:text-white">
                {{ format(weekDays[0], 'd MMM', { locale: el }) }} - {{ format(weekDays[6], 'd MMM yyyy', { locale: el }) }}
              </div>
              <div class="text-xs font-medium text-surface-500 uppercase tracking-widest mt-0.5">Εβδομαδα</div>
            </div>
            <button @click="nextWeek" class="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <span class="material-symbols-outlined text-surface-600 dark:text-surface-400">chevron_right</span>
            </button>
          </div>

          <!-- Calories Progress per week -->
          <div class="flex-1 max-w-sm ml-auto">
            <div class="flex justify-between text-xs font-bold mb-1.5">
              <span class="text-surface-500">Θερμίδες Εβδομάδας</span>
              <span :class="weeklyCalories > (targetCalories * 7) ? 'text-red-500' : 'text-brand-500'">
                {{ weeklyCalories }} / {{ targetCalories * 7 }} kcal
              </span>
            </div>
            <div class="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-700 ease-out"
                :class="{ 'from-red-500 to-rose-500': weeklyCalories > (targetCalories * 7) }"
                :style="{ width: `${Math.min((weeklyCalories / (targetCalories * 7)) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Calendar Grid -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-7 gap-4 animate-pulse">
        <div v-for="i in 7" :key="i" class="h-96 bg-surface-200 dark:bg-surface-800 rounded-3xl" />
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <!-- Day Column -->
        <div v-for="day in weekDays" :key="day.toISOString()" class="flex flex-col gap-3">
          <!-- Day Header -->
          <div class="text-center p-3 rounded-2xl" :class="isSameDay(day, new Date()) ? 'bg-brand-500 text-white shadow-glow' : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white'">
            <div class="text-xs font-bold uppercase tracking-widest">{{ format(day, 'EEEE', { locale: el }) }}</div>
            <div class="text-2xl font-display font-black mt-1">{{ format(day, 'd', { locale: el }) }}</div>
          </div>

          <!-- Meal Slots -->
          <div v-for="mt in mealTypes" :key="mt.id" class="flex flex-col gap-2">
            <h3 class="text-[10px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 flex items-center gap-1.5 px-1 mt-2">
              <span aria-hidden="true">{{ mt.icon }}</span> {{ mt.label }}
            </h3>
            
            <div v-if="getMeal(day, mt.id)" class="group relative bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-3 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all text-sm">
              <button @click="mealStore.removeMeal(getMeal(day, mt.id)!.id)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:scale-110">
                <span class="material-symbols-outlined text-[14px]">close</span>
              </button>
              
              <template v-if="getMeal(day, mt.id)!.recipe_id">
                <NuxtLink :to="`/recipes/${getMeal(day, mt.id)!.recipe?.slug}`" class="font-bold text-brand-600 dark:text-brand-400 hover:underline line-clamp-2">
                  {{ getMeal(day, mt.id)!.recipe?.title }}
                </NuxtLink>
              </template>
              <template v-else>
                <div class="font-bold text-surface-900 dark:text-white line-clamp-2 leading-snug">
                  {{ getMeal(day, mt.id)!.custom_title }}
                </div>
                <div v-if="getMeal(day, mt.id)!.custom_description" class="text-xs text-surface-500 line-clamp-3 mt-1 leading-relaxed">
                  {{ getMeal(day, mt.id)!.custom_description }}
                </div>
              </template>
              
              <div v-if="getMeal(day, mt.id)!.calories || getMeal(day, mt.id)!.recipe?.calories" class="mt-2 text-[10px] font-bold bg-surface-100 dark:bg-surface-800 text-surface-500 px-2 py-1 rounded-md inline-block">
                🔥 {{ getMeal(day, mt.id)!.calories || getMeal(day, mt.id)!.recipe?.calories }} kcal
              </div>
            </div>

            <!-- Empty Slot -->
            <button
              v-else
              @click="openAddModal(day, mt.id)"
              class="h-14 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-400 hover:text-brand-500 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all text-xs font-bold"
            >
              + Προσθήκη
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Custom Meal Modal -->
    <BaseModal :show="showAddModal" @close="showAddModal = false">
      <div class="p-6 space-y-4">
        <h3 class="font-display text-xl font-bold dark:text-white">Προσθήκη Γεύματος</h3>
        <p class="text-sm text-surface-500">Για {{ format(customMealForm.date, 'EEEE d MMM', { locale: el }) }}</p>

        <form @submit.prevent="saveCustomMeal" class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold uppercase text-surface-500 mb-1">Τίτλος</label>
            <input v-model="customMealForm.title" type="text" required class="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2" placeholder="π.χ. Τοστ με ζαμπόν τυρί">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-surface-500 mb-1">Περιγραφή (Προαιρετικό)</label>
            <textarea v-model="customMealForm.description" rows="2" class="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2 text-sm" placeholder="Συστατικά κλπ..."></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-surface-500 mb-1">Θερμίδες (Προαιρετικό)</label>
            <input v-model.number="customMealForm.calories" type="number" class="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2" placeholder="π.χ. 350">
          </div>
          <button type="submit" class="w-full btn-glow py-3 mt-2">Αποθήκευση</button>
        </form>
      </div>
    </BaseModal>

    <!-- AI Generator Modal -->
    <BaseModal :show="showAiModal" @close="showAiModal = false">
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl" aria-hidden="true">🤖</span>
          <h3 class="font-display text-xl font-bold dark:text-white">AI Meal Planner</h3>
        </div>
        <p class="text-sm text-surface-500 dark:text-surface-400">
          Το VibeBites AI θα φτιάξει ένα πλήρες Ελληνικό μενού 7 ημερών (Πρωινό, Μεσημεριανό, Σνακ, Βραδινό)
          προσαρμοσμένο στις θερμίδες σου. Όλα τα προηγούμενα γεύματα της εβδομάδας θα αντικατασταθούν.
        </p>

        <div class="pt-4 space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-surface-500 mb-1">Ημερήσιος Στόχος Θερμίδων</label>
            <div class="flex items-center gap-3">
              <input v-model.number="targetCalories" type="range" min="1200" max="4000" step="50" class="flex-1 accent-brand-500 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer">
              <span class="font-display text-xl font-bold text-brand-500 w-20 text-right">{{ targetCalories }}</span>
            </div>
          </div>

          <button
            @click="generateAiPlan"
            :disabled="isGenerating"
            class="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all"
            :class="isGenerating ? 'bg-surface-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-glow active:scale-95'"
          >
            <span v-if="isGenerating" class="animate-pulse">Δημιουργία... (10-15s)</span>
            <span v-else>✨ Δημιουργία Πλάνου</span>
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
