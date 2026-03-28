import type { Recipe } from '~/types/database'

export function useRecipeOg (
  recipe: Ref<Recipe | null>,
  options?: {
    /** First paragraph / ingredient line for meta description fallback */
    ingredientsSummary?: Ref<string | undefined>
    /** Absolute URL to hero image (e.g. Supabase public storage URL) */
    ogImageUrl?: Ref<string | undefined>
  },
) {
  const config = useRuntimeConfig()
  const siteUrl = computed(
    () => ((config.public.siteUrl as string) || '').replace(/\/$/, '') || '',
  )

  const canonicalPath = computed(
    () => (recipe.value ? `/recipes/${recipe.value.slug}` : '/'),
  )

  const canonicalUrl = computed(() => {
    const base = siteUrl.value
    if (!base || !recipe.value) return ''
    return `${base}${canonicalPath.value}`
  })

  const ogImage = computed(
    () => options?.ogImageUrl?.value ?? '',
  )

  watchEffect(() => {
    const r = recipe.value
    if (!r) return

    const description =
      r.description?.slice(0, 160)
      ?? options?.ingredientsSummary?.value?.slice(0, 160)
      ?? `Cook ${r.title} with VibeBites cooking mode and smart recipe tools.`

    useHead({
      title: `${r.title} · VibeBites`,
      link: canonicalUrl.value
        ? [{ rel: 'canonical', href: canonicalUrl.value }]
        : [],
    })

    useSeoMeta({
      description,
      ogTitle: `${r.title} · VibeBites`,
      ogDescription: description,
      ogType: 'article',
      ogUrl: canonicalUrl.value || undefined,
      ogImage: ogImage.value || undefined,
      ogImageAlt: r.title,
      twitterCard: 'summary_large_image',
      twitterTitle: `${r.title} · VibeBites`,
      twitterDescription: description,
      twitterImage: ogImage.value || undefined,
    })
  })
}
