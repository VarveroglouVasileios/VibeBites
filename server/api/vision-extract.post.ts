import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { image } = body

  if (!image) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing image data'
    })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GROQ_API_KEY not configured'
    })
  }

  // Remove data:image/...;base64, prefix if present
  const base64Image = image.replace(/^data:image\/\w+;base64,/, '')

  try {
    const response = await $fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify all food ingredients visible in this fridge/pantry image. Return ONLY a comma-separated list of ingredients in Greek (ελληνικά). If you see nothing, return an empty string.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 512,
      }
    })

    const ingredients = (response as any).choices?.[0]?.message?.content || ''
    
    return { ingredients }
  } catch (e: any) {
    console.error('Groq Vision Error:', e)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to analyze image with AI'
    })
  }
})
