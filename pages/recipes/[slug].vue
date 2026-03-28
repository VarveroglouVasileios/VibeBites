<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const recipeStore = useRecipeStore()
const authStore = useAuthStore()
const { currentRecipe: recipe, loading } = storeToRefs(recipeStore)
const config = useRuntimeConfig()

const userRating = ref(0)
const showDeleteModal = ref(false)
const deleting = ref(false)

// Fetch recipe
await recipeStore.fetchRecipeBySlug(slug)

// Dynamic SEO
useHead(() => ({
  title: recipe.value?.title || 'Συνταγή',
  meta: [
    { name: 'description', content: recipe.value?.description || '' },
  ],
}))

defineOgImageComponent('RecipeCard' as any, {
  title: recipe.value?.title,
  description: recipe.value?.description,
  image: recipe.value?.media_urls?.[0],
})

// Rate recipe
async function handleRate(score: number) {
  if (!recipe.value) return
  userRating.value = score
  await recipeStore.rateRecipe(recipe.value.id, score)
}

// Find user's existing rating
const existingRating = computed(() => {
  if (!recipe.value?.ratings || !authStore.user) return 0
  const found = (recipe.value.ratings as any[]).find(r => r.user_id === authStore.user!.id)
  return found?.score || 0
})

// Get video URL for sharing
const videoUrl = computed(() => {
  return recipe.value?.media_urls?.find(url =>
    url.match(/\.(mp4|webm|mov)$/i)
  )
})

async function confirmDelete() {
  if (!recipe.value) return
  deleting.value = true
  try {
    const success = await recipeStore.deleteRecipe(recipe.value.id)
    if (success) {
      navigateTo('/recipes')
    }
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <ConfirmModal
      v-if="recipe && showDeleteModal"
      :show="true"
      title="Διαγραφή Συνταγής"
      :message="`Είσαι σίγουρος ότι θέλεις να διαγράψεις τη συνταγή '${recipe.title}'; Αυτή η ενέργεια δεν αναιρείται.`"
      confirm-text="Διαγραφή"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <div v-if="loading" class="space-y-6 animate-pulse">
      <div class="h-8 bg-surface-200 dark:bg-surface-700 rounded-lg w-2/3" />
      <div class="aspect-video bg-surface-200 dark:bg-surface-700 rounded-2xl" />
      <div class="space-y-3">
        <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full" />
        <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
      </div>
    </div>

    <div v-else-if="recipe" class="animate-fade-in">
      <RecipeDetail
        :recipe="recipe as any"
        :ingredients="recipe.ingredients || []"
        :hero-image-url="recipe.media_urls?.[0]"
        :video-url="videoUrl"
      />
    </div>

    <div v-else class="text-center py-20">
      <span class="text-5xl" aria-hidden="true">😔</span>
      <h2 class="mt-4 font-display text-2xl font-bold text-surface-900 dark:text-white">
        Η συνταγή δεν βρέθηκε
      </h2>
      <NuxtLink to="/recipes" class="btn-glow mt-6 inline-block">
        <span aria-hidden="true">←</span> Πίσω στις συνταγές
      </NuxtLink>
    </div>
  </div>
</template>
