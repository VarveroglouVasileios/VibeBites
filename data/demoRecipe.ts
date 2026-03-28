import type { Recipe, RecipeIngredientRow } from '~/types/database'

/** Demo recipe — works without Supabase (see `/recipes/demo`). */
export const demoRecipe: Recipe = {
  id: '00000000-0000-4000-8000-000000000001',
  author_id: '00000000-0000-4000-8000-000000000002',
  title: 'Mediterranean Harvest Bowl',
  slug: 'demo',
  description:
    'Experience the symphony of fresh garden herbs and sun-drenched vegetables. Perfect for a mindful lunch — editorial style from your Stitch reference.',
  instructions: [
    'Roast chickpeas with olive oil and spices for 20 min at 200°C.',
    'Whisk tahini, lemon juice, and a splash of water for the dressing.',
    'Layer greens, chopped cucumber, tomatoes, and warm chickpeas.',
    'Drizzle dressing, finish with fresh herbs and a pinch of salt.',
  ],
  cook_time: 25,
  servings: 2,
  is_vegan: true,
  media_urls: [],
  og_image_url: null,
  fts: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const demoIngredients: RecipeIngredientRow[] = [
  {
    id: '1',
    recipe_id: demoRecipe.id,
    name: 'Chickpeas (cooked)',
    quantity: '400',
    unit: 'g',
    sort_order: 0,
  },
  {
    id: '2',
    recipe_id: demoRecipe.id,
    name: 'Baby spinach',
    quantity: '2',
    unit: 'cups',
    sort_order: 1,
  },
  {
    id: '3',
    recipe_id: demoRecipe.id,
    name: 'Cherry tomatoes',
    quantity: '150',
    unit: 'g',
    sort_order: 2,
  },
  {
    id: '4',
    recipe_id: demoRecipe.id,
    name: 'Tahini',
    quantity: '2',
    unit: 'tbsp',
    sort_order: 3,
  },
  {
    id: '5',
    recipe_id: demoRecipe.id,
    name: 'Lemon juice',
    quantity: '1',
    unit: 'tbsp',
    sort_order: 4,
  },
]
