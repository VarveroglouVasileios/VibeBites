import { z } from 'zod'

export const FridgeMacrosSchema = z.object({
  calories: z.number().int(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
})

export const FridgeIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  unit: z.string(),
})

export const FridgeRecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(FridgeIngredientSchema),
  instructions: z.string(),
  macros: FridgeMacrosSchema,
})

export type FridgeRecipe = z.infer<typeof FridgeRecipeSchema>
