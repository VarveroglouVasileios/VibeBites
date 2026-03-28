// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
    '@nuxt/image',
    'nuxt-og-image',
  ],

  image: {
    format: ['webp'],
    domains: [
      process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/^https?:\/\//, '') : ''
    ].filter(Boolean),
  },

  // ─── Global SEO Defaults ────────────────────────────────
  app: {
    head: {
      htmlAttrs: { lang: 'el' },
      titleTemplate: '%s – VibeBites',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ανακάλυψε, μοιράσου και μαγείρεψε υπέροχες συνταγές με την κοινότητα VibeBites.' },
        { property: 'og:site_name', content: 'VibeBites' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/og-default.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap',
        },
      ],
      script: [
        {
          innerHTML: `
            (function() {
              try {
                var saved = localStorage.getItem('theme');
                var dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (dark) document.documentElement.classList.add('dark');
              } catch (e) {}
            })();
          `,
          type: 'text/javascript',
        }
      ]
    },
  },

  // ─── Runtime Config ─────────────────────────────────────
  runtimeConfig: {
    groqApiKey: process.env.GROQ_API_KEY || '',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  // ─── Supabase ───────────────────────────────────────────
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      include: undefined,
      exclude: ['/', '/recipes', '/recipes/*', '/ai-assistant', '/auth/*'],
      cookieRedirect: false,
    },
  },

  // ─── Tailwind CSS ───────────────────────────────────────
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  // ─── PWA ────────────────────────────────────────────────
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'VibeBites – Social Recipes',
      short_name: 'VibeBites',
      description: 'Discover, share & cook amazing recipes with the VibeBites community.',
      theme_color: '#f97316',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
        },
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 24 hours
            cacheableResponse: { statuses: [0, 200] }
          },
        },
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'supabase-storage-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
            cacheableResponse: { statuses: [0, 200] }
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },

  // ─── TypeScript ─────────────────────────────────────────
  typescript: {
    strict: true,
  },
})
