<script setup lang="ts">
useHead({
  title: 'Συνταγές',
  meta: [
    { name: 'description', content: 'Εξερεύνησε τις καλύτερες συνταγές από την κοινότητα VibeBites.' },
  ],
})

const recipeStore = useRecipeStore()
const { recipes, loading, searchQuery } = storeToRefs(recipeStore)

const filterVegan = ref(false)

onMounted(() => {
  recipeStore.fetchRecipes()
})

async function handleSearch(query: string) {
  await recipeStore.searchRecipes(query)
}

const filteredRecipes = computed(() => {
  if (!filterVegan.value) return recipes.value
  return recipes.value.filter(r => r.is_vegan)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-10">
      <h1 class="font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white">
        <span aria-hidden="true">📖</span> Συνταγές
      </h1>
      <p class="mt-2 text-surface-500 dark:text-surface-400">
        Βρες τη συνταγή που ψάχνεις ή ανακάλυψε κάτι νέο.
      </p>
    </div>

    <div class="max-w-2xl mx-auto mb-8 space-y-4">
      <SearchBar @search="handleSearch" />

      <div class="flex items-center justify-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="filterVegan"
            type="checkbox"
            class="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
          />
          <span class="text-sm text-surface-600 dark:text-surface-400"><span aria-hidden="true">🌱</span> Μόνο Vegan</span>
        </label>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 9" :key="i" class="glass rounded-2xl overflow-hidden">
        <Skeleton class-name="aspect-[4/3]" />
        <div class="p-4 space-y-3">
          <Skeleton class-name="h-5 w-3/4 rounded-lg" />
          <Skeleton class-name="h-4 w-full rounded-lg" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RecipeCard
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
        class="animate-fade-in"
      />
    </div>

    <div v-if="!loading && !filteredRecipes.length" class="text-center py-20">
      <span class="text-5xl" aria-hidden="true">🔍</span>
      <h3 class="mt-4 font-display text-xl font-bold text-surface-900 dark:text-white">
        Δεν βρέθηκαν συνταγές
      </h3>
      <p class="mt-2 text-surface-500">
        {{ searchQuery ? `Δεν βρήκαμε αποτελέσματα για "${searchQuery}".` : 'Δοκίμασε διαφορετικά κριτήρια αναζήτησης.' }}
      </p>
    </div>
  </div>
</template>
