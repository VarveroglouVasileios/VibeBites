import { defineStore } from 'pinia'
import type { Database } from '~/types/database'
import type { Recipe, Ingredient, RecipeFormData } from '~/types'

export const useRecipeStore = defineStore('recipes', () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const recipes = ref<Recipe[]>([])
  const currentRecipe = ref<Recipe | null>(null)
  const loading = ref(false)
  const searchQuery = ref('')

  // ─── Fetch all recipes ──────────────────────────────
  async function fetchRecipes(limit = 20, offset = 0) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          author:profiles!author_id(*),
          ingredients(*),
          ratings(score)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      recipes.value = (data || []).map((r: any) => ({
        ...r,
        average_rating: r.ratings?.length
          ? r.ratings.reduce((sum: number, rt: any) => sum + rt.score, 0) / r.ratings.length
          : 0,
      })) as any as Recipe[]

      return recipes.value
    } catch (err) {
      console.error('Failed to fetch recipes:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // ─── Fetch single recipe by slug ────────────────────
  async function fetchRecipeBySlug(slug: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          author:profiles!author_id(*),
          ingredients(*),
          comments(
            *,
            author:profiles!author_id(*)
          ),
          ratings(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error

      currentRecipe.value = {
        ...(data as any),
        average_rating: data.ratings?.length
          ? (data.ratings as any[]).reduce((sum: number, r: any) => sum + r.score, 0) / data.ratings.length
          : 0,
      } as Recipe

      return currentRecipe.value
    } catch (err) {
      console.error('Failed to fetch recipe:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ─── Search recipes (Greek FTS) ─────────────────────
  async function searchRecipes(query: string) {
    if (!query.trim()) return fetchRecipes()

    loading.value = true
    searchQuery.value = query
    try {
      const { data, error } = await supabase
        .rpc('search_recipes', { query })

      if (error) throw error
      recipes.value = (data as any[] | null) || [] as any as Recipe[]
      return recipes.value
    } catch (err) {
      console.error('Search failed:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // ─── Fetch single recipe by ID ──────────────────────
  async function fetchRecipeById(id: string) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          author:profiles!author_id(*),
          ingredients(*),
          comments(
            *,
            author:profiles!author_id(*)
          ),
          ratings(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      currentRecipe.value = {
        ...(data as any),
        average_rating: data.ratings?.length
          ? (data.ratings as any[]).reduce((sum: number, r: any) => sum + r.score, 0) / data.ratings.length
          : 0,
      } as Recipe

      return currentRecipe.value
    } catch (err) {
      console.error('Failed to fetch recipe by ID:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ─── Create recipe ─────────────────────────────────
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .concat('-', Date.now().toString(36))
  }

  async function createRecipe(formData: RecipeFormData, mediaUrls: string[]) {
    if (!user.value) return null

    loading.value = true
    try {
      const slug = generateSlug(formData.title)

      // Insert recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          author_id: user.value.id,
          title: formData.title,
          slug,
          description: formData.description,
          instructions: formData.instructions as any,
          cook_time: formData.cook_time,
          servings: formData.servings,
          is_vegan: formData.is_vegan,
          media_urls: mediaUrls,
          og_image_url: mediaUrls[0] || null,
        })
        .select()
        .single()

      if (recipeError) throw recipeError

      // Insert ingredients
      if (formData.ingredients.length > 0) {
        const ingredients = formData.ingredients.map((ing, i) => ({
          recipe_id: recipe.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          sort_order: i,
        }))

        const { error: ingError } = await supabase
          .from('ingredients')
          .insert(ingredients)

        if (ingError) throw ingError
      }

      return recipe as any as Recipe
    } catch (err) {
      console.error('Failed to create recipe:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ─── Update recipe ─────────────────────────────────
  async function updateRecipe(id: string, formData: RecipeFormData, mediaUrls: string[]) {
    if (!user.value) return null

    loading.value = true
    try {
      // Update recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .update({
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions as any,
          cook_time: formData.cook_time,
          servings: formData.servings,
          is_vegan: formData.is_vegan,
          media_urls: mediaUrls,
          og_image_url: mediaUrls[0] || null,
        })
        .eq('id', id)
        .select()
        .single()

      if (recipeError) throw recipeError

      // Update ingredients: Delete existing ones first
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .eq('recipe_id', id)

      if (deleteError) throw deleteError

      // Insert new ingredients
      if (formData.ingredients.length > 0) {
        const ingredients = formData.ingredients.map((ing, i) => ({
          recipe_id: id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          sort_order: i,
        }))

        const { error: ingError } = await supabase
          .from('ingredients')
          .insert(ingredients)

        if (ingError) throw ingError
      }

      return recipe as any as Recipe
    } catch (err) {
      console.error('Failed to update recipe:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ─── Delete recipe ─────────────────────────────────
  async function deleteRecipe(id: string) {
    if (!user.value) return false

    loading.value = true
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      recipes.value = recipes.value.filter(r => r.id !== id)

      return true
    } catch (err) {
      console.error('Failed to delete recipe:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // ─── Rate recipe ────────────────────────────────────
  async function rateRecipe(recipeId: string, score: number) {
    if (!user.value) return null

    try {
      const { data, error } = await supabase
        .from('ratings')
        .upsert(
          { recipe_id: recipeId, user_id: user.value.id, score },
          { onConflict: 'recipe_id,user_id' }
        )
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Failed to rate recipe:', err)
      return null
    }
  }

  // ─── Add comment ────────────────────────────────────
  async function addComment(recipeId: string, body: string, photoUrl?: string, parentId?: string) {
    if (!user.value) return null

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          recipe_id: recipeId,
          author_id: user.value.id,
          body,
          photo_url: photoUrl || null,
          parent_id: parentId || null,
        })
        .select(`*, author:profiles!author_id(*)`)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Failed to add comment:', err)
      return null
    }
  }

  return {
    recipes,
    currentRecipe,
    loading,
    searchQuery,
    fetchRecipes,
    fetchRecipeBySlug,
    fetchRecipeById,
    searchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    rateRecipe,
    addComment,
  }
})
