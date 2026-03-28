import type { AiRecipeResponse } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ ingredients: string[]; isVegan: boolean }>(event)

  // ─── Validate input ─────────────────────────────────
  if (!body.ingredients || !Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide at least one ingredient.',
    })
  }

  if (!config.groqApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Groq API key is not configured.',
    })
  }

  // ─── Build system prompt ────────────────────────────
  const veganConstraint = body.isVegan
    ? 'The recipe MUST be 100% vegan. Do NOT include any animal products.'
    : ''

  const systemPrompt = `You are a world-class chef assistant. The user will give you a list of ingredients they have in their fridge.
You MUST respond ONLY with a valid JSON object matching this exact schema (no markdown, no explanation, no extra fields):

{
  "title": "string — creative recipe name",
  "description": "string — a 1-2 sentence description of the dish",
  "ingredients": [
    {
      "name": "string — ingredient name",
      "quantity": "string — amount (e.g. '2', '1/2')",
      "unit": "string — unit (e.g. 'cups', 'tbsp', 'pieces')"
    }
  ],
  "instructions": ["string — step 1", "string — step 2"],
  "macros": {
    "calories": "number — estimated total calories",
    "protein": "number — grams of protein",
    "carbs": "number — grams of carbohydrates",
    "fat": "number — grams of fat"
  },
  "is_vegan": "boolean — whether the recipe is vegan"
}

${veganConstraint}

Rules:
- Use ONLY the ingredients provided, plus common pantry staples (salt, pepper, oil, water, basic spices).
- Provide realistic nutritional estimates.
- Instructions should be clear, numbered steps.
- ALWAYS respond with valid JSON. No text before or after the JSON.`

  const userMessage = `I have these ingredients: ${body.ingredients.join(', ')}.
${body.isVegan ? 'I want a VEGAN recipe only.' : 'Create the best recipe you can.'}
Please suggest a creative recipe.`

  // ─── Call Groq API ──────────────────────────────────
  try {
    const response = await $fetch<{
      choices: Array<{ message: { content: string } }>
    }>('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024,
      },
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      throw createError({
        statusCode: 502,
        statusMessage: 'No response from AI.',
      })
    }

    // Parse and validate JSON
    const recipe: AiRecipeResponse = JSON.parse(content)

    // Basic validation
    if (!recipe.title || !recipe.ingredients || !recipe.instructions || !recipe.macros) {
      throw createError({
        statusCode: 502,
        statusMessage: 'AI returned an incomplete recipe.',
      })
    }

    return recipe
  } catch (error: any) {
    // If it's already an H3 error, re-throw
    if (error.statusCode) throw error

    console.error('Groq API error:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to generate recipe. Please try again.',
    })
  }
})
