import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { record } = await req.json()

    // Log the message receipt (In a real app, send email here)
    console.log(`New contact message from ${record.name} (${record.email}): ${record.message}`)

    /**
     * EXAMPLE: Sending email via Resend
     * 
     * await fetch('https://api.resend.com/emails', {
     *   method: 'POST',
     *   headers: {
     *     'Content-Type': 'application/json',
     *     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
     *   },
     *   body: JSON.stringify({
     *     from: 'VibeBites <notifications@vibebites.gr>',
     *     to: ['varveroglou@hotmail.gr'],
     *     subject: `Νέο Μήνυμα από ${record.name}`,
     *     html: `<p>Έχεις νέο μήνυμα!</p><p><strong>Από:</strong> ${record.name}</p><p><strong>Email:</strong> ${record.email}</p><p><strong>Μήνυμα:</strong> ${record.message}</p>`
     *   })
     * })
     */

    return new Response(JSON.stringify({ success: true }), {
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
