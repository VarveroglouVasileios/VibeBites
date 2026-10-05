<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Recipe, RecipeIngredientRow, Database } from '~/types/database'

const props = defineProps<{
  recipe: Recipe
  ingredients: RecipeIngredientRow[]
  /** Absolute URL for Open Graph image */
  heroImageUrl?: string | null
  /** Optional external recipe video (TikTok, YouTube, etc.) */
  videoUrl?: string | null
}>()

const config = useRuntimeConfig()
const siteUrl = computed(
  () => ((config.public.siteUrl as string) || '').replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : ''),
)

const checkedIds = ref<Set<string>>(new Set())

function toggleIngredient (id: string) {
  const next = new Set(checkedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  checkedIds.value = next
}

const sortedIngredients = computed(() =>
  [...props.ingredients].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
)

const ingredientsSummary = computed(() =>
  sortedIngredients.value
    .slice(0, 5)
    .map((i) => i.name)
    .join(', '),
)

const recipeRef = toRef(props, 'recipe')
const ogImageRef = computed(() => props.heroImageUrl ?? undefined)

// @ts-ignore
useRecipeOg(recipeRef, {
  ingredientsSummary,
  ogImageUrl: ogImageRef,
})

const { isSupported: wakeSupported, isActive: wakeActive, request: wakeRequest, release: wakeRelease } =
  useWakeLock()

const cookingMode = ref(false)

async function toggleCookingMode () {
  if (!cookingMode.value) {
    cookingMode.value = true
    await wakeRequest()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    cookingMode.value = false
    await wakeRelease()
  }
}

const { share, canNativeShare } = useRecipeShare()

const targetServings = ref(props.recipe.servings || 1)
const showSocialModal = ref(false)
const userRating = ref(0)

const shareUrl = computed(() => `${siteUrl.value}/recipes/${props.recipe.slug}`)

// Find user's existing rating
const existingRating = computed(() => {
  if (!(props.recipe as any).ratings || !auth.user) return 0
  const found = ((props.recipe as any).ratings as any[]).find(r => r.user_id === auth.user?.id)
  return found?.score || 0
})

// Rate recipe
async function handleRate(score: number) {
  if (!props.recipe) return
  userRating.value = score
  await recipeStore.rateRecipe(props.recipe.id, score)
}

function instructionText (step: unknown): string {
  if (typeof step === 'string') return step
  if (step && typeof step === 'object' && 'text' in step && typeof (step as { text: unknown }).text === 'string') {
    return (step as { text: string }).text
  }
  return ''
}

const instructionSteps = computed(() => {
  const raw = props.recipe.instructions
  if (!Array.isArray(raw)) return []
  return raw
    .map((step, index) => ({
      text: instructionText(step),
      order: step && typeof step === 'object' && 'order' in step && typeof (step as { order: unknown }).order === 'number'
        ? (step as { order: number }).order
        : index + 1,
    }))
    .sort((a, b) => a.order - b.order)
})

const socialSummary = computed(() => {
  const steps = instructionSteps.value.length
    ? instructionSteps.value.map((step, i) => `${i + 1}. ${step.text}`).join('\n')
    : instructionText(props.recipe.instructions)
  
  return `✨ ${props.recipe.title} ✨\n\n` +
    `🧾 Υλικά:\n${props.ingredients.map(i => `- ${i.quantity || ''} ${i.unit || ''} ${i.name}`).join('\n')}\n\n` +
    `📝 Οδηγίες:\n${steps}\n\n` +
    `🔗 Δες τη συνταγή εδώ: ${shareUrl.value}\n#VibeBites #Cooking #Recipes`
})

function copySocialSummary() {
  navigator.clipboard.writeText(socialSummary.value)
  toast.success('Το κείμενο για TikTok/Instagram αντιγράφηκε!')
  showSocialModal.value = false
}

async function onShare () {
  // @ts-ignore
  const video = props.videoUrl ?? props.recipe.video_url
  const text = [
    props.recipe.description ?? '',
    video ? `Video: ${video}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const result = await share({
    title: props.recipe.title,
    text,
    url: shareUrl.value,
  })

  if (result.ok && result.method === 'clipboard') {
    toast.success('Το link αντιγράφηκε!')
  }
}
import { useAuthStore } from '~/stores/auth'
import { useRecipeStore } from '~/stores/recipes'

const auth = useAuthStore()
const recipeStore = useRecipeStore()
const supabase = useSupabaseClient<Database>()
const router = useRouter()

const isDeleting = ref(false)

async function deleteRecipe () {
  if (!confirm('Are you sure you want to delete this recipe? This cannot be undone.')) return
  isDeleting.value = true
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', props.recipe.id)

    if (error) throw error
    toast.success('Η συνταγή διαγράφηκε επιτυχώς.')
    router.push('/')
  } catch (e) {
    toast.error('Αποτυχία διαγραφής: ' + (e as Error).message)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div :class="['min-h-screen transition-colors duration-500', cookingMode ? 'bg-surface-50 dark:bg-surface-900' : 'bg-white dark:bg-surface-950']">
    <!-- Social Summary Modal -->
    <BaseModal :show="showSocialModal" @close="showSocialModal = false">
      <div class="p-6">
        <h3 class="text-xl font-bold mb-4 dark:text-white">TikTok/Instagram Summary</h3>
        <p class="text-sm text-surface-500 dark:text-surface-400 mb-4">Αυτό το κείμενο είναι έτοιμο για copy-paste στα social media σου!</p>
        <div class="bg-surface-100 dark:bg-surface-800 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto mb-6 dark:text-surface-200 border dark:border-surface-700">
          {{ socialSummary }}
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="copySocialSummary" class="btn-glow flex-1">Copy to Clipboard</button>
          <button @click="showSocialModal = false" class="btn-secondary flex-1">Close</button>
        </div>
      </div>
    </BaseModal>

    <!-- Hero Section -->
    <section class="relative h-[40vh] min-h-[300px] w-full overflow-hidden md:h-[60vh]">
      <NuxtImg
        v-if="heroImageUrl"
        class="h-full w-full object-cover transition-transform duration-700"
        :class="cookingMode ? 'scale-105' : 'scale-100'"
        :src="heroImageUrl"
        :alt="recipe.title"
        width="1200"
        height="600"
        format="webp"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-950/40 to-transparent" />
      <div class="absolute bottom-0 left-0 w-full p-6 md:p-12">
        <div class="mx-auto max-w-6xl">
          <div class="mb-4 flex flex-wrap gap-2">
            <span
              v-if="recipe.is_vegan"
              class="badge-success shadow-lg"
            >Vegan</span>
            <span
              v-if="recipe.cook_time"
              class="badge-brand shadow-lg"
            >{{ recipe.cook_time }} Mins</span>
          </div>
          <h1
            class="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white md:text-6xl drop-shadow-sm"
          >
            {{ recipe.title }}
          </h1>
        </div>
      </div>
    </section>

    <main class="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-8 md:pt-12">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <!-- Left Column: Ingredients & Instructions -->
        <div class="lg:col-span-8 space-y-12 md:space-y-16">
          <section id="ingredients">
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 class="font-display text-2xl md:text-3xl font-bold tracking-tight dark:text-white">
                Υλικά
              </h2>
              <div class="flex items-center gap-4 bg-surface-50 dark:bg-surface-900 px-4 py-2 rounded-2xl border dark:border-surface-800">
                <span class="text-[10px] font-bold uppercase tracking-wider text-surface-500">Μερίδες</span>
                <input 
                  v-model.number="targetServings" 
                  type="range" 
                  min="1" 
                  max="20" 
                  class="w-20 md:w-24 accent-brand-500"
                />
                <span class="min-w-[2ch] font-display text-xl font-bold text-brand-500">{{ targetServings }}</span>
              </div>
            </div>
            <div class="glass p-6 md:p-8">
              <IngredientChecklist 
                :ingredients="sortedIngredients" 
                :recipe-id="recipe.id"
                :recipe-title="recipe.title"
                :target-servings="targetServings"
                :original-servings="recipe.servings || 1"
              />
            </div>
          </section>

          <section id="instructions">
            <h2 class="mb-8 font-display text-2xl md:text-3xl font-bold tracking-tight dark:text-white">
              Οδηγίες
            </h2>
            <div class="space-y-8 md:space-y-12">
              <template v-if="instructionSteps.length">
                <div
                  v-for="(step, idx) in instructionSteps"
                  :key="idx"
                  class="flex gap-4 md:gap-6 transition-all duration-300"
                  :class="cookingMode ? 'p-6 rounded-2xl bg-white dark:bg-surface-800 shadow-glow border border-brand-500/20' : ''"
                >
                  <div
                    class="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 font-display text-lg md:text-xl font-bold text-brand-600 dark:text-brand-400 transition-all duration-300"
                  >
                    {{ idx + 1 }}
                  </div>
                  <div class="pt-1">
                    <div
                      class="text-surface-700 dark:text-surface-300"
                      :class="cookingMode ? 'text-xl leading-relaxed md:text-3xl font-medium' : 'text-base md:text-lg leading-relaxed'"
                    >
                      {{ step.text }}
                    </div>
                  </div>
                </div>
              </template>
              <div
                v-else
                class="flex gap-4 md:gap-6 transition-all duration-300"
                :class="cookingMode ? 'p-6 rounded-2xl bg-white dark:bg-surface-800 shadow-glow border border-brand-500/20' : ''"
              >
                <div
                  class="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 font-display text-lg md:text-xl font-bold text-brand-600 dark:text-brand-400 transition-all duration-300"
                >
                  1
                </div>
                <div class="pt-1">
                  <div
                    class="whitespace-pre-wrap text-surface-700 dark:text-surface-300"
                    :class="cookingMode ? 'text-xl leading-relaxed md:text-3xl font-medium' : 'text-base md:text-lg leading-relaxed'"
                  >
                    {{ instructionText(recipe.instructions) }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column: Sidebar Stats & CTA -->
        <aside class="h-fit space-y-6 lg:sticky lg:top-28 lg:col-span-4">
          <!-- Cooking Mode Card (Single Instance) -->
          <div class="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-8 text-white shadow-xl relative overflow-hidden group">
            <h3 class="mb-4 font-display text-2xl font-extrabold relative z-10">
              {{ cookingMode ? 'Cooking Mode Active' : 'Έτοιμος για μαγείρεμα;' }}
            </h3>
            <p class="mb-8 leading-relaxed text-white/90 relative z-10 text-sm md:text-base">
              {{
                cookingMode
                  ? 'Οι οδηγίες έχουν μεγαλώσει για ευκολία. Η οθόνη θα παραμείνει ανοιχτή.'
                  : 'Ενεργοποίησε το Cooking Mode για hands-free οδηγίες και αποφυγή σβησίματος της οθόνης.'
              }}
            </p>
            <button
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-display text-lg font-black text-brand-600 shadow-lg transition-all hover:scale-[1.02] active:scale-95 relative z-10"
              @click="toggleCookingMode"
            >
              <span class="material-symbols-outlined">{{ cookingMode ? 'stop_circle' : 'play_circle' }}</span>
              {{ cookingMode ? 'Έξοδος' : 'Έναρξη Cooking Mode' }}
            </button>
          </div>

          <!-- Recipe Actions (Simplified) -->
          <div class="glass p-6 space-y-4">
            <h4 class="mb-4 flex items-center gap-2 font-display font-bold text-surface-900 dark:text-white uppercase tracking-widest text-[10px]">
              Βαθμολογία
            </h4>
            <div class="flex items-center justify-between">
              <RatingStars
                :model-value="userRating || existingRating"
                :readonly="!auth.isLoggedIn"
                @update:model-value="handleRate"
              />
              <span v-if="(recipe as any).average_rating" class="text-xs font-bold text-surface-500">
                {{ Number((recipe as any).average_rating).toFixed(1) }} / 5
              </span>
            </div>
            <p v-if="!auth.isLoggedIn" class="text-[10px] text-surface-400">
              <NuxtLink to="/auth/login" class="text-brand-500 hover:underline">Συνδέσου</NuxtLink> για να βαθμολογήσεις.
            </p>

            <div class="pt-4 border-t border-surface-100 dark:border-surface-800 space-y-3">
              <h4 class="mb-4 flex items-center gap-2 font-display font-bold text-surface-900 dark:text-white uppercase tracking-widest text-[10px]">
                Ενέργειες Συνταγής
              </h4>
              
              <button
                class="flex w-full items-center justify-center gap-3 rounded-2xl border-2 dark:border-surface-700 bg-white dark:bg-surface-800 py-3.5 font-display text-sm font-bold text-surface-900 dark:text-white shadow-sm transition-all hover:bg-surface-50 dark:hover:bg-surface-700 active:scale-95"
                @click="onShare"
              >
                <span class="material-symbols-outlined text-lg">share</span>
                {{ canNativeShare ? 'Μοιράσου το' : 'Αντιγραφή Link' }}
              </button>

              <button
                class="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 py-3.5 font-display text-sm font-bold text-brand-600 dark:text-brand-400 shadow-sm transition-all hover:bg-brand-500/20 active:scale-95"
                @click="showSocialModal = true"
              >
                <span class="material-symbols-outlined text-lg">auto_awesome</span>
                Social Summary
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Comments Section -->
      <div class="mt-16 pt-16 border-t border-surface-100 dark:border-surface-800">
        <div class="max-w-3xl">
          <CommentSection
            :recipe-id="recipe.id"
            :comments="(recipe as any).comments || []"
          />
        </div>
      </div>
    </main>

    <!-- Admin Action Bar -->
    <div
      v-if="auth.isAdmin"
      class="fixed bottom-6 right-6 z-50 flex flex-row md:flex-col gap-3 md:bottom-auto md:top-24"
    >
      <NuxtLink
        :to="`/recipes/edit/${recipe.id}`"
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-transform hover:scale-110 active:scale-95"
        title="Edit Recipe"
      >
        <span class="material-symbols-outlined">edit</span>
      </NuxtLink>
      <button
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-xl ring-1 ring-red-100 dark:ring-red-900/30 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
        title="Delete Recipe"
        :disabled="isDeleting"
        @click="deleteRecipe"
      >
        <span class="material-symbols-outlined">{{ isDeleting ? 'sync' : 'delete' }}</span>
      </button>
    </div>
  </div>
</template>
