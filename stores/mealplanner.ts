import { defineStore } from 'pinia'
import type { Database } from '~/types/database'
import type { MealPlan } from '~/types'

export const useMealPlannerStore = defineStore('mealplanner', () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const mealPlans = ref<MealPlan[]>([])
  const loading = ref(false)

  // Calculate the start of the week (Monday)
  function getStartOfWeek(date: Date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  // ─── Fetch a week of meals ────────────────────────────
  async function fetchWeek(referenceDate: Date = new Date()) {
    if (!user.value) return
    loading.value = true

    const start = getStartOfWeek(referenceDate)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    // Format for Supabase query (YYYY-MM-DD)
    const startDateStr = start.toISOString().split('T')[0]
    const endDateStr = end.toISOString().split('T')[0]

    try {
      const { data, error } = await (supabase
        .from('meal_plans' as any) as any)
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('user_id', user.value.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)

      if (error) throw error
      mealPlans.value = (data || []) as any as MealPlan[]
    } catch (err) {
      console.error('Failed to fetch meal plans:', err)
    } finally {
      loading.value = false
    }
  }

  // ─── Add or update a meal ────────────────────────────
  async function addMeal(params: {
    date: string
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    recipe_id?: string
    custom_title?: string
    custom_description?: string
    calories?: number
  }) {
    if (!user.value) return false

    try {
      const { error } = await (supabase
        .from('meal_plans' as any) as any)
        .upsert({
          user_id: user.value.id,
          date: params.date,
          meal_type: params.meal_type,
          recipe_id: params.recipe_id || null,
          custom_title: params.custom_title || null,
          custom_description: params.custom_description || null,
          calories: params.calories || null,
        }, {
          onConflict: 'user_id, date, meal_type'
        })

      if (error) throw error
      
      // Refresh the week
      await fetchWeek(new Date(params.date))
      return true
    } catch (err) {
      console.error('Failed to add meal:', err)
      return false
    }
  }

  // ─── Remove a meal ──────────────────────────────────
  async function removeMeal(id: string) {
    try {
      const { error } = await (supabase
        .from('meal_plans' as any) as any)
        .delete()
        .eq('id', id)

      if (error) throw error
      mealPlans.value = mealPlans.value.filter(m => m.id !== id)
      return true
    } catch (err) {
      console.error('Failed to remove meal:', err)
      return false
    }
  }

  const weeklyCalories = computed(() => {
    return mealPlans.value.reduce((sum, plan) => {
      if (plan.calories) return sum + plan.calories
      if (plan.recipe?.calories) return sum + plan.recipe.calories
      return sum
    }, 0)
  })

  return {
    mealPlans,
    loading,
    weeklyCalories,
    fetchWeek,
    addMeal,
    removeMeal,
  }
})
