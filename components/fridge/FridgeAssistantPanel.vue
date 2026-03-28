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
      reader.onload = () => resolve(reader.result as string)
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
  <div class="space-y-12">
    <section class="relative overflow-hidden rounded-[2rem] bg-primary-container p-8 md:p-12">
      <div class="relative z-10 max-w-2xl">
        <h1 class="mb-4 font-headline text-4xl font-extrabold leading-tight tracking-tight text-on-primary-container md:text-5xl">
          Your Fridge is a <br><span class="text-white">Culinary Canvas.</span>
        </h1>
        <p class="mb-8 font-body text-lg text-on-primary-container/80">
          Tell us what's on your shelves — AI returns structured JSON (title, ingredients, macros).
        </p>

        <div class="rounded-3xl bg-surface-container-lowest p-4 shadow-xl shadow-on-primary-container/10">
          <div class="flex flex-col gap-4">
            <div class="relative">
              <label class="mb-2 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>What ingredients do you have?</span>
                <label class="flex items-center gap-1 text-brand-500 cursor-pointer hover:opacity-80 transition-opacity">
                  <span class="material-symbols-outlined text-sm">{{ analyzing ? 'sync' : 'photo_camera' }}</span>
                  <span>{{ analyzing ? 'Ανάλυση...' : 'Φωτογραφία Ψυγείου' }}</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" :disabled="analyzing" />
                </label>
              </label>
              <textarea
                v-model="rawIngredients"
                class="h-32 w-full resize-none rounded-2xl border-none bg-surface-container-low p-4 font-body text-on-surface focus:ring-2 focus:ring-primary-container"
                placeholder="e.g. 2 Tomatoes, Spinach, Half an onion..."
              />
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 px-2">
              <div class="flex items-center gap-3">
                <span class="text-sm font-semibold text-on-surface-variant">Vegan Only</span>
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="vegan ? 'bg-primary-container' : 'bg-outline-variant'"
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
                class="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-on-primary transition-transform hover:scale-105 disabled:opacity-50"
                :disabled="loading"
                @click="runFridge"
              >
                <span class="material-symbols-outlined">{{ loading ? 'sync' : 'auto_awesome' }}</span>
                {{ loading ? 'Generating...' : 'Generate Recipe' }}
              </button>
            </div>
          </div>
        </div>
        <p class="mt-4 text-sm text-on-primary-container/90">
          Χρειάζεσαι <code class="rounded bg-black/10 px-1">GROQ_API_KEY</code> στο <code class="rounded bg-black/10 px-1">.env</code> για να τρέξει το AI τοπικά.
        </p>
        <p
          v-if="!canSave"
          class="mt-2 text-sm text-on-primary-container/80"
        >
          Συνδέσου με Supabase για να αποθηκεύεις συνταγές στη βάση.
        </p>
      </div>

      <div class="pointer-events-none absolute -bottom-10 -right-10 hidden rotate-12 md:block">
        <div class="h-64 w-64 overflow-hidden rounded-full border-8 border-white/20 shadow-2xl">
          <img
            src="/stitch/assistant.png"
            alt=""
            class="h-full w-full object-cover"
          >
        </div>
      </div>
      <div class="pointer-events-none absolute -right-20 top-0 hidden h-80 w-80 rounded-full bg-primary-fixed-dim/30 blur-3xl md:block" />
    </section>

    <div
      v-if="errMsg"
      class="rounded-2xl bg-error-container/40 p-4 text-sm text-error"
    >
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
