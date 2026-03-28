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

    // Log the message receipt (Avoid logging PII like name/email)
    console.log(`New contact message received. ID: ${record.id}`)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'varveroglou@hotmail.gr'

    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'VibeBites <notifications@vibebites.gr>',
          to: [adminEmail],
          subject: `Νέο Μήνυμα από ${record.name}`,
          html: `
            <h2>Έχεις νέο μήνυμα επικοινωνίας!</h2>
            <p><strong>Από:</strong> ${record.name}</p>
            <p><strong>Email:</strong> ${record.email}</p>
            <p><strong>Μήνυμα:</strong></p>
            <div style="padding: 15px; background: #f4f4f4; border-radius: 8px;">
              ${record.message}
            </div>
            <hr />
            <p><small>Αυτό το μήνυμα στάλθηκε αυτόματα από το VibeBites System.</small></p>
          `
        })
      })
    }

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
