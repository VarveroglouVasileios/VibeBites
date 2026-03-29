export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const groqApiKey = config.groqApiKey

  if (!groqApiKey) {
    throw createError({
      statusCode: 500,
      message: 'GROQ_API_KEY is not configured',
    })
  }

  const body = await readBody<{
    targetCalories: number
    days: number
  }>(event)

  if (!body.targetCalories) {
    throw createError({
      statusCode: 400,
      message: 'targetCalories is required',
    })
  }

  const systemPrompt = `We are VibeBites, a Greek cooking assistant.

Your task is to generate a structured weekly meal plan for ${body.days || 7} days. 
The user's daily calorie target is approximately ${body.targetCalories} θερμίδες.

STRICT INSTRUCTIONS:
1. You MUST generate exactly ${body.days || 7} days.
2. For each day, generate 4 meals: "breakfast", "lunch", "dinner", "snack".
3. The names, descriptions, and all text MUST be in natural, fluent Greek (Ελληνικά).
4. Do NOT use Greeklish, do NOT use Latin characters, do NOT use robotic translations.
5. The sum of calories for the 4 meals each day should roughly equal the target calories (${body.targetCalories}).
6. You MUST return ONLY a raw, unquoted JSON array. No markdown, no backticks, no explanations.

The generic format of the JSON should be:
[
  {
    "dateOffset": 0, // 0 for today, 1 for tomorrow, etc.
    "meals": [
      {
        "type": "breakfast",
        "title": "Ομελέτα με Σπανάκι και Φέτα",
        "description": "2 αυγά, 1 χούφτα σπανάκι, 30γρ φέτα, 1 φέτα ψωμί ολικής",
        "calories": 350
      },
      // ... lunch, dinner, snack
    ]
  },
  // ... repeated for the number of days required
]
`

  try {
    const data = await $fetch<any>('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Φτιάξε μου ένα πλάνο γευμάτων για ${body.days || 7} ημέρες, με στόχο ${body.targetCalories} θερμίδες την ημέρα. Επέστρεψε ΜΟΝΟ JSON.` }
        ],
        temperature: 0.6,
        max_tokens: 3500,
      }
    })

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Groq invalid response:', data)
      throw new Error('Invalid response from AI model')
    }

    const content = data.choices[0].message.content.trim()
    
    // Clean up potential markdown formatting
    let jsonString = content
    if (jsonString.startsWith('```')) {
      const lines = jsonString.split('\n')
      if (lines[0].startsWith('```')) lines.shift()
      if (lines[lines.length - 1].startsWith('```')) lines.pop()
      jsonString = lines.join('\n')
    }

    const payload = JSON.parse(jsonString)
    return payload
  } catch (error: any) {
    console.error('AI Meal Planner Generation Failed:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'AI Generation failed',
    })
  }
})
