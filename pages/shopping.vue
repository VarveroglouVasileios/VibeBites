<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Λίστα Αγορών - VibeBites' })

const shoppingStore = useShoppingStore()
const { items, loading, itemsByCategory, checkedCount, totalCount } = storeToRefs(shoppingStore)

const newItemName = ref('')
const newItemQuantity = ref('')
const newItemUnit = ref('')
const showAddForm = ref(false)

onMounted(() => {
  shoppingStore.fetchItems()
})

async function addCustomItem() {
  if (!newItemName.value.trim()) return
  const success = await shoppingStore.addCustomItem(
    newItemName.value,
    newItemQuantity.value || undefined,
    newItemUnit.value || undefined
  )
  if (success) {
    toast.success('Προστέθηκε στη λίστα!')
    newItemName.value = ''
    newItemQuantity.value = ''
    newItemUnit.value = ''
    showAddForm.value = false
  }
}

async function handleClearChecked() {
  if (checkedCount.value === 0) return
  await shoppingStore.clearChecked()
  toast.success('Τα επιλεγμένα αφαιρέθηκαν!')
}

async function handleClearAll() {
  if (totalCount.value === 0) return
  await shoppingStore.clearAll()
  toast.success('Η λίστα καθαρίστηκε!')
}

const progress = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((checkedCount.value / totalCount.value) * 100)
})

const categoryIcons: Record<string, string> = {
  'Προϊόντα': '🥬',
  'Πρωτεΐνη': '🥩',
  'Γαλακτοκομικά': '🧀',
  'Ντουλάπι': '🫙',
  'Άλλα': '📦',
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Header -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/5 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4">
          <span class="text-5xl" aria-hidden="true">🛒</span>
          <h1 class="font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">
            Λίστα Αγορών
          </h1>
          <p class="text-surface-500 dark:text-surface-400 max-w-lg mx-auto">
            Πρόσθεσε υλικά από τις αγαπημένες σου συνταγές και πήγαινε στο σούπερ μάρκετ οργανωμένος!
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Stats Bar -->
      <div v-if="totalCount > 0" class="glass rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-surface-500 dark:text-surface-400">
            {{ checkedCount }} / {{ totalCount }} υλικά
          </span>
          <span class="font-bold text-brand-500">{{ progress }}%</span>
        </div>
        <div class="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-700 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center gap-3">
        <button
          @click="showAddForm = !showAddForm"
          class="btn-glow text-sm !px-4 !py-2.5 flex items-center gap-2"
        >
          <span aria-hidden="true">➕</span>
          Προσθήκη Υλικού
        </button>
        <button
          v-if="checkedCount > 0"
          @click="handleClearChecked"
          class="btn-ghost text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
        >
          <span aria-hidden="true">✓</span>
          Καθαρισμός ({{ checkedCount }})
        </button>
        <button
          v-if="totalCount > 0"
          @click="handleClearAll"
          class="btn-ghost text-sm flex items-center gap-2 text-red-500"
        >
          <span aria-hidden="true">🗑️</span>
          Διαγραφή Όλων
        </button>
      </div>

      <!-- Quick Add Form -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-2 scale-95"
      >
        <form v-if="showAddForm" @submit.prevent="addCustomItem" class="glass rounded-2xl p-4 space-y-3">
          <div class="grid grid-cols-6 gap-3">
            <input
              v-model="newItemName"
              type="text"
              placeholder="Όνομα υλικού..."
              required
              class="col-span-6 sm:col-span-3 bg-white/50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
            <input
              v-model="newItemQuantity"
              type="text"
              placeholder="Ποσότητα"
              class="col-span-3 sm:col-span-1 bg-white/50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
            <input
              v-model="newItemUnit"
              type="text"
              placeholder="Μονάδα"
              class="col-span-3 sm:col-span-1 bg-white/50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
            <button type="submit" class="col-span-6 sm:col-span-1 btn-glow text-sm !py-2.5">
              Προσθήκη
            </button>
          </div>
        </form>
      </Transition>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-14 rounded-xl animate-pulse bg-surface-200 dark:bg-surface-800" />
      </div>

      <!-- Empty State -->
      <div v-else-if="totalCount === 0" class="text-center py-16 space-y-4">
        <span class="text-6xl" aria-hidden="true">🛒</span>
        <h2 class="font-display text-xl font-bold text-surface-900 dark:text-white">Η λίστα σου είναι άδεια!</h2>
        <p class="text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
          Πρόσθεσε υλικά χειροκίνητα ή πήγαινε σε μια συνταγή και πάτα "Προσθήκη στη Λίστα Αγορών".
        </p>
        <NuxtLink to="/recipes" class="inline-flex btn-glow text-sm !px-6 !py-3 mt-2">
          <span aria-hidden="true">📖</span> Δες Συνταγές
        </NuxtLink>
      </div>

      <!-- Shopping List by Category -->
      <template v-else>
        <div v-for="(catItems, category) in itemsByCategory" :key="category" class="space-y-2">
          <!-- Category Header -->
          <div class="flex items-center gap-2 px-1 pt-2">
            <span class="text-lg" aria-hidden="true">{{ categoryIcons[category] || '📦' }}</span>
            <h3 class="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500">
              {{ category }}
            </h3>
            <span class="text-[10px] text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-full">
              {{ catItems.length }}
            </span>
          </div>

          <!-- Items -->
          <div class="space-y-1">
            <div
              v-for="item in catItems"
              :key="item.id"
              class="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-surface-50 dark:hover:bg-surface-800/50"
              :class="item.is_checked ? 'opacity-50' : ''"
            >
              <!-- Checkbox -->
              <button
                @click="shoppingStore.toggleItem(item.id)"
                class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer"
                :class="item.is_checked
                  ? 'bg-brand-500 border-brand-500'
                  : 'border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 hover:border-brand-400'"
                :aria-label="item.is_checked ? 'Αποεπιλογή' : 'Επιλογή'"
              >
                <svg v-if="item.is_checked" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <!-- Item Info -->
              <div class="flex-1 min-w-0">
                <span
                  class="text-sm dark:text-surface-300 transition-all duration-200"
                  :class="item.is_checked ? 'line-through text-surface-400 dark:text-surface-500' : ''"
                >
                  <span v-if="item.quantity" class="font-semibold text-surface-900 dark:text-white">{{ item.quantity }}</span>
                  <span v-if="item.unit" class="text-surface-500 dark:text-surface-400 text-xs"> {{ item.unit }}</span>
                  {{ item.name }}
                </span>
                <span
                  v-if="item.recipe_title"
                  class="block text-[10px] text-surface-400 dark:text-surface-500 truncate mt-0.5"
                >
                  📖 {{ item.recipe_title }}
                </span>
              </div>

              <!-- Delete Button -->
              <button
                @click="shoppingStore.removeItem(item.id)"
                class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                aria-label="Αφαίρεση"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- All Done -->
        <div
          v-if="progress === 100 && totalCount > 0"
          class="mt-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center animate-scale-in"
        >
          <span class="text-4xl" aria-hidden="true">🎉</span>
          <p class="mt-2 font-display font-bold text-lg text-emerald-600 dark:text-emerald-400">
            Πήρες τα πάντα!
          </p>
          <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Ώρα για μαγειρική! 👨‍🍳
          </p>
        </div>
      </template>
    </section>
  </div>
</template>
