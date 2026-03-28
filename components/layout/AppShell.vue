<script setup lang="ts">
const route = useRoute()

function navClass (path: string) {
  const active =
    path === '/'
      ? route.path === '/'
      : route.path === path || route.path.startsWith(`${path}/`)
  return [
    'flex items-center gap-4 rounded-xl px-4 py-3 font-headline transition-all',
    active
      ? 'border-r-4 border-primary bg-primary-fixed-dim/30 font-bold text-primary'
      : 'text-on-surface-variant hover:bg-surface-container-low',
  ]
}

function mobileClass (path: string) {
  const active =
    path === '/'
      ? route.path === '/'
      : route.path === path || route.path.startsWith(`${path}/`)
  return [
    'flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition-transform active:scale-90',
    active
      ? 'bg-primary-fixed-dim/40 font-semibold text-primary'
      : 'text-on-surface-variant',
  ]
}
</script>

<template>
  <div class="min-h-screen bg-surface font-body text-on-surface">
    <!-- Top bar -->
    <header
      class="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between bg-white/80 px-6 shadow-sm backdrop-blur-xl dark:bg-slate-950/80"
    >
      <NuxtLink
        to="/"
        class="font-headline text-xl font-extrabold tracking-tight text-primary"
      >
        Culinary Curator
      </NuxtLink>
      <div class="hidden max-w-md flex-1 px-8 md:flex">
        <div class="relative w-full">
          <span
            class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          >search</span>
          <input
            type="search"
            class="w-full rounded-full border-none bg-surface-container-highest py-2 pl-10 pr-4 text-sm transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
            placeholder="Search for recipes, ingredients..."
          >
        </div>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/saved"
          class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-primary-fixed-dim/30"
        >
          <span class="material-symbols-outlined">account_circle</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Sidebar desktop -->
    <aside
      class="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col bg-surface-container-low pt-20 md:flex dark:bg-slate-900"
    >
      <div class="flex flex-col gap-1 px-4">
        <NuxtLink
          to="/"
          :class="navClass('/')"
        >
          <span class="material-symbols-outlined">home</span>
          <span>Home</span>
        </NuxtLink>
        <NuxtLink
          to="/explore"
          :class="navClass('/explore')"
        >
          <span class="material-symbols-outlined">search</span>
          <span>Explore</span>
        </NuxtLink>
        <NuxtLink
          to="/assistant"
          :class="navClass('/assistant')"
        >
          <span class="material-symbols-outlined">smart_toy</span>
          <span>AI Assistant</span>
        </NuxtLink>
        <NuxtLink
          to="/saved"
          :class="navClass('/saved')"
        >
          <span class="material-symbols-outlined">bookmark</span>
          <span>Saved</span>
        </NuxtLink>
      </div>
      <div class="mt-auto p-6">
        <div class="rounded-2xl bg-primary-container/20 p-4">
          <p class="mb-2 text-xs font-bold uppercase tracking-wider text-on-primary-container">
            The Living Kitchen
          </p>
          <p class="mb-4 text-sm text-on-surface-variant">
            Premium Cooking
          </p>
          <button
            type="button"
            class="w-full rounded-xl bg-primary py-2 text-sm font-bold text-on-primary shadow-sm hover:opacity-90"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="pb-28 pt-20 md:ml-64 md:pb-12">
      <slot />
    </main>

    <!-- Mobile bottom -->
    <nav
      class="fixed bottom-0 left-0 z-50 flex w-full justify-around rounded-t-3xl bg-white/90 px-2 pb-6 pt-3 shadow-[0_-4px_20px_0_rgba(11,28,48,0.06)] backdrop-blur-lg md:hidden dark:bg-slate-950/90"
    >
      <NuxtLink
        to="/"
        :class="mobileClass('/')"
      >
        <span class="material-symbols-outlined">restaurant</span>
        <span class="font-label text-[11px] font-semibold uppercase tracking-wider">Home</span>
      </NuxtLink>
      <NuxtLink
        to="/assistant"
        :class="mobileClass('/assistant')"
      >
        <span class="material-symbols-outlined">kitchen</span>
        <span class="font-label text-[11px] font-semibold uppercase tracking-wider">Fridge AI</span>
      </NuxtLink>
      <NuxtLink
        to="/recipes/demo"
        :class="mobileClass('/recipes/demo')"
      >
        <span class="material-symbols-outlined">outdoor_grill</span>
        <span class="font-label text-[11px] font-semibold uppercase tracking-wider">Cooking</span>
      </NuxtLink>
      <NuxtLink
        to="/explore"
        :class="mobileClass('/explore')"
      >
        <span class="material-symbols-outlined">share</span>
        <span class="font-label text-[11px] font-semibold uppercase tracking-wider">Social</span>
      </NuxtLink>
    </nav>

    <NuxtLink
      to="/assistant"
      class="fixed bottom-28 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary shadow-xl transition-transform hover:scale-110 active:scale-95 md:bottom-8"
      aria-label="Open AI assistant"
    >
      <span class="material-symbols-outlined text-2xl">smart_toy</span>
    </NuxtLink>
  </div>
</template>
