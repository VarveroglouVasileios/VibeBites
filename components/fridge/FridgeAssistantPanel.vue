<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Database } from '~/types/database'
import type { FridgeRecipe } from '~/types/fridge-recipe'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const rawIngredients = ref('ντομάτα\nελαιόλαδο\nσκόρδο')
const vegan = ref(false)
const loading = ref(false)
const analyzing = ref(false)
const saving = ref(false)
const photoPreview = ref<string | null>(null)
const errMsg = ref<string | null>(null)
const suggestedRecipe = ref<FridgeRecipe | null>(null)

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  analyzing.value = true
  errMsg.value = null
  
  try {
    // Convert to base64
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => {
        const result = reader.result as string
        photoPreview.value = result
        resolve(result)
      }
    })
    reader.readAsDataURL(file)
    const base64 = await base64Promise

    const { ingredients } = await $fetch<{ ingredients: string }>('/api/vision-extract', {
      method: 'POST',
      body: { image: base64 }
    })

    if (ingredients) {
      // Append to current ingredients
      const current = rawIngredients.value.trim()
      rawIngredients.value = (current ? current + '\n' : '') + ingredients.split(',').map(i => i.trim()).join('\n')
      toast.success('Τα υλικά αναγνωρίστηκαν!')
    }
  } catch (e: any) {
    toast.error('Αποτυχία ανάλυσης εικόνας: ' + e.message)
  } finally {
    analyzing.value = false
  }
}

function removePreview() {
  photoPreview.value = null
}

const canSave = computed(() => Boolean(user.value))

async function runFridge () {
  errMsg.value = null
  suggestedRecipe.value = null
  loading.value = true
  try {
    const ingredients = rawIngredients.value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    if (ingredients.length === 0) {
      errMsg.value = 'Πρόσθεσε τουλάχιστον ένα υλικό.'
      return
    }

    const data = await $fetch<{ recipe: FridgeRecipe }>('/api/fridge-suggest', {
      method: 'POST',
      body: { ingredients, vegan: vegan.value },
    })
    suggestedRecipe.value = data.recipe
    await nextTick()
    document.getElementById('fridge-result')?.scrollIntoView({ behavior: 'smooth' })
  } catch (e: unknown) {
    const err = e as {
      data?: { statusMessage?: string; message?: string }
      statusMessage?: string
      message?: string
    }
    errMsg.value =
      err.data?.statusMessage
      ?? err.data?.message
      ?? err.statusMessage
      ?? err.message
      ?? 'Αποτυχία κλήσης AI.'
  } finally {
    loading.value = false
  }
}

async function saveToRecipes (recipe: FridgeRecipe) {
  if (!user.value) return
  saving.value = true
  try {
    const slug =
      recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      + '-'
      + Math.random().toString(36).slice(2, 7)
// 1. Insert Recipe
const { data: newRecipe, error: recipeError } = await supabase
  .from('recipes')
  .insert({
    author_id: user.value.id,
    title: recipe.title,
    slug,
    description: recipe.description,
    instructions: [recipe.instructions], // Store as array
    is_vegan: vegan.value,
    cook_time: 20, // Default or derived
    servings: 2,   // Default
  })
  .select()
  .single()

if (recipeError) throw recipeError

// 2. Insert Ingredients
const ingredientsToInsert = recipe.ingredients.map((ing, idx) => ({
  recipe_id: newRecipe.id,
  name: ing.name,
  quantity: ing.amount,
  unit: ing.unit,
  sort_order: idx,
}))

const { error: ingError } = await supabase
  .from('ingredients')
  .insert(ingredientsToInsert)

    if (ingError) throw ingError

    toast.success('Η συνταγή αποθηκεύτηκε στη συλλογή σου!')
    suggestedRecipe.value = null
  } catch (e) {
    toast.error('Αποτυχία αποθήκευσης: ' + (e as Error).message)
  } finally {
    saving.value = false
  }
}

const { share } = useRecipeShare()

async function onShare (recipe: FridgeRecipe) {
  await share({
    title: recipe.title,
    text: recipe.description,
    url: typeof window !== 'undefined' ? window.location.href : '',
  })
}
</script>

<template>
  <div class="space-y-8 md:space-y-12">
    <section class="relative overflow-hidden rounded-3xl md:rounded-[2rem] bg-brand-500 dark:bg-brand-600 p-6 md:p-12 text-white shadow-xl">
      <div class="relative z-10 max-w-2xl">
        <h1 class="mb-4 font-display text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Το Ψυγείο σου είναι <br><span class="text-brand-100">Καμβάς Δημιουργίας.</span>
        </h1>
        <p class="mb-8 font-display text-base md:text-lg text-white/80">
          Πες μας τι έχεις στα ράφια σου — ο AI Βοηθός θα σου προτείνει μια ολοκληρωμένη συνταγή με όλα τα θρεπτικά συστατικά.
        </p>

        <div class="glass-strong !bg-white/95 dark:!bg-surface-900/95 p-4 md:p-6 shadow-2xl">
          <div class="flex flex-col gap-4">
            <div class="relative">
              <label class="mb-2 flex items-center justify-between px-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400">
                <span>Τι υλικά έχεις;</span>
                <label class="flex items-center gap-1 text-brand-500 cursor-pointer hover:opacity-80 transition-opacity">
                  <span class="material-symbols-outlined text-sm">{{ analyzing ? 'sync' : 'photo_camera' }}</span>
                  <span class="text-[10px] md:text-xs">{{ analyzing ? 'Ανάλυση...' : 'Φωτογραφία Ψυγείου' }}</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" :disabled="analyzing" />
                </label>
              </label>

              <!-- Image Preview -->
              <div v-if="photoPreview" class="mb-4 relative w-20 h-20 md:w-24 md:h-24 group animate-scale-in">
                <img :src="photoPreview" class="w-full h-full object-cover rounded-xl md:rounded-2xl border-2 border-brand-500 shadow-glow" />
                <button 
                  @click="removePreview"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >✕</button>
              </div>

              <textarea
                v-model="rawIngredients"
                class="h-32 w-full resize-none rounded-xl md:rounded-2xl border-none bg-surface-50 dark:bg-surface-800 p-4 font-sans text-sm md:text-base text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none"
                placeholder="π.χ. 2 ντομάτες, σπανάκι, μισό κρεμμύδι..."
              />
            </div>
            
            <div class="flex flex-wrap items-center justify-between gap-4 px-1 md:px-2">
              <div class="flex items-center gap-3">
                <span class="text-xs md:text-sm font-semibold text-surface-700 dark:text-surface-300">Μόνο Vegan</span>
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="vegan ? 'bg-brand-500' : 'bg-surface-200 dark:bg-surface-700'"
                  @click="vegan = !vegan"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="vegan ? 'translate-x-5' : 'translate-x-0.5'"
                  />
                </button>
              </div>
              
              <button
                type="button"
                class="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl md:rounded-full bg-brand-500 px-8 py-3 font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-glow disabled:opacity-50"
                :disabled="loading"
                @click="runFridge"
              >
                <span class="material-symbols-outlined text-lg">{{ loading ? 'sync' : 'auto_awesome' }}</span>
                {{ loading ? 'Δημιουργία...' : 'Βρες μου Συνταγή!' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="pointer-events-none absolute -bottom-10 -right-10 hidden rotate-12 md:block">
        <div class="h-64 w-64 overflow-hidden rounded-full border-8 border-white/20 shadow-2xl backdrop-blur-sm">
          <img
            src="/pwa-512x512.png"
            alt=""
            class="h-full w-full object-cover"
          >
        </div>
      </div>
      <div class="pointer-events-none absolute -right-20 top-0 hidden h-80 w-80 rounded-full bg-white/10 blur-3xl md:block" />
    </section>

    <div
      v-if="errMsg"
      class="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400 flex items-center gap-3 animate-slide-down"
    >
      <span class="material-symbols-outlined">error</span>
      {{ errMsg }}
    </div>

    <div
      v-if="suggestedRecipe"
      id="fridge-result"
      class="scroll-mt-24"
    >
      <SuggestedRecipeCard
        :recipe="suggestedRecipe"
        :loading="saving"
        :can-save="canSave"
        @save="saveToRecipes"
        @share="onShare"
      />
    </div>
  </div>
</template>
