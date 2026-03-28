import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as {
      ingredients?: string[]
      vegan?: boolean
    }

    const ingredients = Array.isArray(body.ingredients)
      ? body.ingredients.map((s) => String(s).trim()).filter(Boolean)
      : []
    const vegan = Boolean(body.vegan)

    if (ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Provide a non-empty ingredients array.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const system = [
      'You are a professional recipe engineer for the VibeBites / "Culinary Curator" app.',
      'Given a list of ingredients, output ONE cohesive recipe optimized for home cooks.',
      vegan
        ? 'The recipe MUST be fully vegan. Never suggest animal products.'
        : 'Animal products are allowed unless they conflict with the listed ingredients.',
      'Return ONLY valid minified JSON with exactly these keys:',
      'title (string), description (string),',
      'ingredients (array of { name, amount, unit } strings),',
      'instructions (string, step-by-step as one text block),',
      'macros (object with calories integer, protein_g, carbs_g, fat_g numbers for the full batch).',
      'No markdown, no code fences, no keys other than those above.',
    ].join('\n')

    const userPrompt =
      `Ingredients on hand:\n${ingredients.map((i) => `- ${i}`).join('\n')}\n` +
      'Respond with JSON only.'

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq error', groqRes.status, errText)
      return new Response(
        JSON.stringify({ error: 'Groq request failed', detail: errText }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    const groqJson = (await groqRes.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = groqJson.choices?.[0]?.message?.content
    if (!content) {
      return new Response(JSON.stringify({ error: 'Empty model response' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const parsed = JSON.parse(content) as unknown

    return new Response(JSON.stringify({ recipe: parsed }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
