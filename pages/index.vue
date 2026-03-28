<script setup lang="ts">
useHead({
  title: 'Αρχική',
  meta: [
    { name: 'description', content: 'VibeBites – Ανακάλυψε, μοιράσου και μαγείρεψε υπέροχες συνταγές με AI βοηθό, cooking mode και κοινότητα.' },
    { property: 'og:title', content: 'VibeBites – Social Recipes' },
    { property: 'og:description', content: 'Discover, share & cook amazing recipes with the VibeBites community.' },
  ],
})

const recipeStore = useRecipeStore()
const { recipes, loading } = storeToRefs(recipeStore)

const currentSeason = computed(() => {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Autumn'
  return 'Winter'
})

const seasonalContent = {
  Spring: {
    badge: '🌸 Ανοιξιάτικες Γεύσεις',
    title: 'Φρεσκάδα στο Πιάτο σου.',
    subtitle: 'Ανακάλυψε ελαφριές συνταγές με τα καλύτερα υλικά της άνοιξης.'
  },
  Summer: {
    badge: '☀️ Καλοκαιρινή Αύρα',
    title: 'Δροσιά & Απόλαυση.',
    subtitle: 'Δροσερές σαλάτες και καλοκαιρινά πιάτα για τις ζεστές μέρες.'
  },
  Autumn: {
    badge: '🍂 Φθινοπωρινή Ζεστασιά',
    title: 'Γεύσεις του Δάσους.',
    subtitle: 'Ζεστές σούπες και πλούσια πιάτα με φθινοπωρινά αρώματα.'
  },
  Winter: {
    badge: '❄️ Χειμωνιάτικη Θαλπωρή',
    title: 'Ζεστασιά στην Καρδιά.',
    subtitle: 'Παραδοσιακές συνταγές και comfort food για το χειμώνα.'
  }
}

const content = computed(() => seasonalContent[currentSeason.value])

onMounted(() => {
  recipeStore.fetchRecipes(6)
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden">
      <!-- Background gradient orbs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-float" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div class="text-center max-w-3xl mx-auto">
          <div class="animate-fade-in">
            <span class="badge-brand text-sm mb-4 inline-block"><span aria-hidden="true">{{ content.badge.split(' ')[0] }}</span> {{ content.badge.split(' ').slice(1).join(' ') }}</span>
          </div>

          <h1 class="font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight animate-slide-up">
            <span class="text-surface-900 dark:text-white">{{ content.title.split(' ')[0] }}</span>
            <br />
            <span class="gradient-text">{{ content.title.split(' ').slice(1).join(' ') }}</span>
          </h1>

          <p class="mt-6 text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-xl mx-auto animate-slide-up" style="animation-delay: 0.1s">
            {{ content.subtitle }}
          </p>

          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style="animation-delay: 0.2s">
            <NuxtLink to="/recipes" class="btn-glow text-base">
              <span aria-hidden="true">🔍</span> Εξερεύνησε Συνταγές
            </NuxtLink>
            <NuxtLink to="/ai-assistant" class="btn-secondary text-base">
              <span aria-hidden="true">🤖</span> AI Βοηθός Ψυγείου
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass p-6 text-center card-hover animate-slide-up" style="animation-delay: 0.1s">
          <span class="text-4xl" aria-hidden="true">🤖</span>
          <h3 class="mt-3 font-display font-bold text-lg text-surface-900 dark:text-white">AI Fridge Assistant</h3>
          <p class="mt-2 text-sm text-surface-500">Βάλε τα υλικά που έχεις και ο AI σου δίνει τέλεια συνταγή με macros.</p>
        </div>
        <div class="glass p-6 text-center card-hover animate-slide-up" style="animation-delay: 0.2s">
          <span class="text-4xl" aria-hidden="true">👩‍🍳</span>
          <h3 class="mt-3 font-display font-bold text-lg text-surface-900 dark:text-white">Cooking Mode</h3>
          <p class="mt-2 text-sm text-surface-500">Η οθόνη μένει ανοιχτή ενώ μαγειρεύεις. Τσεκάρεις τα υλικά βήμα-βήμα.</p>
        </div>
        <div class="glass p-6 text-center card-hover animate-slide-up" style="animation-delay: 0.3s">
          <span class="text-4xl" aria-hidden="true">📱</span>
          <h3 class="mt-3 font-display font-bold text-lg text-surface-900 dark:text-white">Social & PWA</h3>
          <p class="mt-2 text-sm text-surface-500">Μοιράσου σε TikTok & Instagram. Εγκατάστησε σαν app στο κινητό σου.</p>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="font-display text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            <span aria-hidden="true">🔥</span> Trending Συνταγές
          </h2>
          <p class="mt-1 text-sm text-surface-500">Οι πιο δημοφιλείς συνταγές αυτή τη στιγμή.</p>
        </div>
        <NuxtLink to="/recipes" class="btn-ghost text-sm">
          Δες όλες →
        </NuxtLink>
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="glass rounded-2xl overflow-hidden">
          <Skeleton class-name="aspect-[4/3]" />
          <div class="p-4 space-y-3">
            <Skeleton class-name="h-5 w-3/4 rounded-lg" />
            <Skeleton class-name="h-4 w-full rounded-lg" />
            <Skeleton class-name="h-4 w-1/2 rounded-lg" />
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>

      <div v-if="!loading && !recipes.length" class="text-center py-16">
        <span class="text-5xl" aria-hidden="true">🍳</span>
        <h3 class="mt-4 font-display text-xl font-bold text-surface-900 dark:text-white">
          Δεν υπάρχουν συνταγές ακόμα
        </h3>
        <p class="mt-2 text-surface-500">Σύντομα θα υπάρχουν υπέροχες συνταγές εδώ!</p>
        <NuxtLink to="/ai-assistant" class="btn-glow mt-6 inline-block">
          <span aria-hidden="true">🤖</span> Δοκίμασε τον AI Βοηθό
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
