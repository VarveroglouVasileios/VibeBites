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

const shareUrl = computed(() => `${siteUrl.value}/recipes/${props.recipe.slug}`)

const socialSummary = computed(() => {
  const steps = Array.isArray(props.recipe.instructions) 
    ? (props.recipe.instructions as any[]).map((s, i) => `${i+1}. ${s?.text || s}`).join('\n')
    : props.recipe.instructions
  
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

const auth = useAuthStore()
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
  <div :class="['min-h-screen transition-colors duration-500', cookingMode ? 'bg-surface-container-low' : 'bg-surface']">
    <!-- Social Summary Modal -->
    <BaseModal :show="showSocialModal" @close="showSocialModal = false">
      <div class="p-6">
        <h3 class="text-xl font-bold mb-4">TikTok/Instagram Summary</h3>
        <p class="text-sm text-surface-500 mb-4">Αυτό το κείμενο είναι έτοιμο για copy-paste στα social media σου!</p>
        <div class="bg-surface-100 dark:bg-surface-800 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto mb-6">
          {{ socialSummary }}
        </div>
        <div class="flex gap-3">
          <button @click="copySocialSummary" class="btn-glow flex-1">Copy to Clipboard</button>
          <button @click="showSocialModal = false" class="btn-secondary">Close</button>
        </div>
      </div>
    </BaseModal>

    <!-- Hero Section -->
    <section class="relative h-[50vh] min-h-[400px] w-full overflow-hidden md:h-[60vh]">
      <img
        v-if="heroImageUrl"
        class="h-full w-full object-cover transition-transform duration-700"
        :class="cookingMode ? 'scale-105' : 'scale-100'"
        :src="heroImageUrl"
        :alt="recipe.title"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
      <div class="absolute bottom-0 left-0 w-full p-6 md:p-12">
        <div class="mx-auto max-w-6xl">
          <div class="mb-4 flex flex-wrap gap-2">
            <span
              v-if="recipe.is_vegan"
              class="rounded-full bg-primary-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-primary-container"
            >Vegan</span>
            <span
              v-if="recipe.cook_time"
              class="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >{{ recipe.cook_time }} Mins</span>
          </div>
          <h1
            class="max-w-3xl font-headline text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl"
          >
            {{ recipe.title }}
          </h1>
        </div>
      </div>
    </section>

    <main class="mx-auto max-w-6xl px-6 pb-24 pt-12">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <!-- Left Column: Ingredients & Instructions -->
        <div class="lg:col-span-8 space-y-16">
          <section id="ingredients">
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 class="font-headline text-3xl font-bold tracking-tight">
                Ingredients
              </h2>
              <div class="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-2xl border border-outline-variant">
                <span class="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Servings</span>
                <input 
                  v-model.number="targetServings" 
                  type="range" 
                  min="1" 
                  max="20" 
                  class="w-24 accent-brand-500"
                />
                <span class="min-w-[2ch] font-headline text-xl font-bold text-primary">{{ targetServings }}</span>
              </div>
            </div>
            <div class="rounded-3xl bg-surface-container-low p-6 md:p-8">
              <IngredientChecklist 
                :ingredients="sortedIngredients" 
                :recipe-id="recipe.id"
                :target-servings="targetServings"
                :original-servings="recipe.servings || 1"
              />
            </div>
          </section>

          <section id="instructions">
            <h2 class="mb-8 font-headline text-3xl font-bold tracking-tight">
              Instructions
            </h2>
            <div class="space-y-12">
              <template v-if="Array.isArray(recipe.instructions)">
                <div
                  v-for="(step, idx) in recipe.instructions"
                  :key="idx"
                  class="flex gap-6 transition-all duration-300"
                  :class="cookingMode ? 'p-4 rounded-2xl bg-white shadow-ambient' : ''"
                >
                  <div
                    class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-container/20 font-headline text-xl font-bold text-primary transition-all duration-300"
                  >
                    {{ idx + 1 }}
                  </div>
                  <div class="pt-1">
                    <div
                      class="text-on-surface-variant"
                      :class="cookingMode ? 'text-xl leading-relaxed md:text-2xl' : 'text-lg leading-relaxed'"
                    >
                      {{ step }}
                    </div>
                  </div>
                </div>
              </template>
              <div
                v-else
                class="flex gap-6 transition-all duration-300"
                :class="cookingMode ? 'p-4 rounded-2xl bg-white shadow-ambient' : ''"
              >
                <div
                  class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-container/20 font-headline text-xl font-bold text-primary transition-all duration-300"
                >
                  1
                </div>
                <div class="pt-1">
                  <div
                    class="whitespace-pre-wrap text-on-surface-variant"
                    :class="cookingMode ? 'text-xl leading-relaxed md:text-2xl' : 'text-lg leading-relaxed'"
                  >
                    {{ recipe.instructions }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column: Sidebar Stats & CTA -->
        <aside class="h-fit space-y-6 lg:sticky lg:top-28 lg:col-span-4">
          <!-- Enter Cooking Mode Card -->
          <div class="rounded-[2rem] bg-gradient-to-br from-secondary to-secondary-container p-8 text-white shadow-xl">
            <h3 class="mb-4 font-headline text-2xl font-extrabold">
              {{ cookingMode ? 'Cooking Mode Active' : 'Ready to Start?' }}
            </h3>
            <p class="mb-8 leading-relaxed text-white/90">
              {{
                cookingMode
                  ? 'Instruction text is enlarged. Your screen will stay awake while you cook.'
                  : 'Enter cooking mode to get hands-free instructions and prevent your screen from dimming.'
              }}
            </p>
            <button
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-headline text-lg font-black text-secondary shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              @click="toggleCookingMode"
            >
              <span class="material-symbols-outlined">{{ cookingMode ? 'stop_circle' : 'play_circle' }}</span>
              {{ cookingMode ? 'Exit Cooking Mode' : 'Enter Cooking Mode' }}
            </button>
          </div>

          <!-- Nutrition & Meta -->
          <div
            class="rounded-3xl border border-surface-container bg-surface-container-lowest p-6 shadow-sm"
          >
            <h4 class="mb-6 flex items-center gap-2 font-headline font-bold text-on-surface">
              <span class="material-symbols-outlined text-emerald-600">nutrition</span>
              Recipe Info
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-if="recipe.servings"
                class="rounded-2xl bg-surface-container-low p-4"
              >
                <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Servings</span>
                <span class="block font-headline text-xl font-bold text-on-surface">{{ recipe.servings }}</span>
              </div>
              <div
                v-if="recipe.cook_time"
                class="rounded-2xl bg-surface-container-low p-4"
              >
                <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Time</span>
                <span class="block font-headline text-xl font-bold text-on-surface">{{ recipe.cook_time }}m</span>
              </div>
            </div>
          </div>

          <!-- Social Share -->
          <div class="p-6 space-y-3">
            <button
              class="flex w-full items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-white py-4 font-headline text-lg font-bold text-on-surface shadow-sm transition-all hover:bg-surface-container-low active:scale-95"
              @click="onShare"
            >
              <span class="material-symbols-outlined">share</span>
              {{ canNativeShare ? 'Share with Friends' : 'Copy Link' }}
            </button>
            <button
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500/10 py-4 font-headline text-lg font-bold text-brand-600 shadow-sm transition-all hover:bg-brand-500/20 active:scale-95"
              @click="showSocialModal = true"
            >
              <span class="material-symbols-outlined">auto_awesome</span>
              Social Summary
            </button>
          </div>
        </aside>
      </div>
    </main>

    <!-- Admin Action Bar -->
    <div
      v-if="auth.isAdmin"
      class="fixed right-6 top-20 z-50 flex flex-col gap-3"
    >
      <button
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-on-surface shadow-xl ring-1 ring-outline-variant transition-transform hover:scale-110 active:scale-95"
        title="Edit Recipe"
      >
        <span class="material-symbols-outlined">edit</span>
      </button>
      <button
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-error-container text-error shadow-xl ring-1 ring-error transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
        title="Delete Recipe"
        :disabled="isDeleting"
        @click="deleteRecipe"
      >
        <span class="material-symbols-outlined">{{ isDeleting ? 'sync' : 'delete' }}</span>
      </button>
    </div>
  </div>
</template>
