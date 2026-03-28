// ─── User / Profile ───────────────────────────────────
export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

// ─── Recipe ───────────────────────────────────────────
export interface RecipeStep {
  order: number
  text: string
}

export interface Recipe {
  id: string
  author_id: string
  title: string
  slug: string
  description: string | null
  instructions: RecipeStep[]
  cook_time: number | null
  servings: number | null
  is_vegan: boolean
  media_urls: string[]
  og_image_url: string | null
  created_at: string
  updated_at: string
  // Joined fields
  author?: Profile
  ingredients?: Ingredient[]
  comments?: Comment[]
  ratings?: Rating[]
  average_rating?: number
}

// ─── Ingredient ───────────────────────────────────────
export interface Ingredient {
  id: string
  recipe_id: string
  name: string
  quantity: string | null
  unit: string | null
  sort_order: number
}

// ─── Comment ──────────────────────────────────────────
export interface Comment {
  id: string
  recipe_id: string
  author_id: string
  body: string
  photo_url: string | null
  parent_id: string | null
  created_at: string
  // Joined
  author?: Profile
  replies?: Comment[]
}

// ─── Rating ───────────────────────────────────────────
export interface Rating {
  id: string
  recipe_id: string
  user_id: string
  score: number
  created_at: string
}

// ─── AI Fridge Assistant ──────────────────────────────
export interface AiIngredient {
  name: string
  quantity: string
  unit: string
}

export interface AiMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface AiRecipeResponse {
  title: string
  description: string
  ingredients: AiIngredient[]
  instructions: string[]
  macros: AiMacros
  is_vegan: boolean
}

// ─── Form Types ───────────────────────────────────────
export interface RecipeFormData {
  title: string
  description: string
  instructions: RecipeStep[]
  cook_time: number | null
  servings: number | null
  is_vegan: boolean
  ingredients: Omit<Ingredient, 'id' | 'recipe_id'>[]
  media_files: File[]
}
