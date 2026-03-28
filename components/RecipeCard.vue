<script setup lang="ts">
import type { Recipe } from '~/types'

const props = defineProps<{
  recipe: Recipe
}>()

const authStore = useAuthStore()
const recipeStore = useRecipeStore()

const showDeleteModal = ref(false)
const deleting = ref(false)

const averageRating = computed(() => {
  if (!props.recipe.ratings?.length) return 0
  const sum = (props.recipe.ratings as any[]).reduce((acc, r) => acc + (r.score || 0), 0)
  return (sum / props.recipe.ratings.length).toFixed(1)
})

const coverImage = computed(() =>
  props.recipe.media_urls?.[0] || '/placeholder-recipe.jpg'
)

async function confirmDelete() {
  deleting.value = true
  try {
    await recipeStore.deleteRecipe(props.recipe.id)
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="relative group glass card-hover rounded-2xl overflow-hidden">
    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      :show="true"
      title="Διαγραφή Συνταγής"
      :message="`Είσαι σίγουρος ότι θέλεις να διαγράψεις τη συνταγή '${recipe.title}'; Αυτή η ενέργεια δεν αναιρείται.`"
      confirm-text="Διαγραφή"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Admin Actions -->
    <div
      v-if="authStore.isAdmin"
      class="absolute top-3 right-3 z-30 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
    >
      <NuxtLink
        :to="`/recipes/edit/${recipe.id}`"
        class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/95 dark:bg-surface-800/95 text-brand-600 dark:text-brand-400 hover:bg-brand-500 hover:text-white transition-all shadow-lg backdrop-blur-sm border dark:border-surface-700"
        title="Επεξεργασία"
        aria-label="Επεξεργασία συνταγής"
      >
        <span class="text-sm" aria-hidden="true">✏️</span>
      </NuxtLink>
      <button
        @click.stop.prevent="showDeleteModal = true"
        class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/95 dark:bg-surface-800/95 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg backdrop-blur-sm border dark:border-surface-700"
        title="Διαγραφή"
        aria-label="Διαγραφή συνταγής"
      >
        <span class="text-sm" aria-hidden="true">🗑️</span>
      </button>
    </div>

    <NuxtLink
      :to="`/recipes/${recipe.slug}`"
      class="block"
    >
      <!-- Image Container -->
      <div class="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden">
        <NuxtImg
          :src="coverImage"
          :alt="recipe.title"
          width="400"
          height="300"
          format="webp"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent" />

        <!-- Top Badges -->
        <div class="absolute top-3 left-3 flex flex-wrap gap-2">
          <span v-if="recipe.is_vegan" class="badge-success !bg-emerald-500 !text-white border-none shadow-glow">
            <span aria-hidden="true">🌱</span> Vegan
          </span>
        </div>

        <!-- Bottom Stats over Image -->
        <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div v-if="recipe.cook_time" class="badge bg-black/40 text-white backdrop-blur-md text-[10px] border-none">
            <span aria-hidden="true">⏱️</span> {{ recipe.cook_time }}′
          </div>
          <div v-if="Number(averageRating) > 0" class="flex items-center gap-1 badge bg-white/20 text-white backdrop-blur-md text-[10px] border-none">
            <span class="text-yellow-400" aria-hidden="true">★</span>
            <span aria-label="Αξιολόγηση">{{ averageRating }}</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4 md:p-5">
        <h3 class="font-display font-bold text-lg text-surface-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1">
          {{ recipe.title }}
        </h3>

        <p v-if="recipe.description" class="mt-1.5 text-sm text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
          {{ recipe.description }}
        </p>

        <!-- Author Footer -->
        <div class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800/50 flex items-center justify-between">
          <div v-if="recipe.author" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-surface-800 shadow-sm">
              <img
                v-if="recipe.author.avatar_url"
                :src="recipe.author.avatar_url"
                :alt="recipe.author.username"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ recipe.author.username?.[0]?.toUpperCase() || '?' }}</span>
            </div>
            <span class="text-xs font-semibold text-surface-700 dark:text-surface-300">{{ recipe.author.username }}</span>
          </div>
          <span class="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{{ new Date(recipe.created_at).toLocaleDateString('el-GR') }}</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
