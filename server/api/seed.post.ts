/**
 * Seed endpoint – registers the admin user via normal signUp.
 * The SQL trigger in 004_admin_seed.sql auto-promotes the role.
 *
 * Call once: POST /api/seed
 */
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_KEY || ''

  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing SUPABASE_URL or SUPABASE_KEY in .env',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const adminEmail = (process.env.ADMIN_EMAIL) as string
  const adminPassword = (process.env.ADMIN_PASSWORD) as string
  const adminUsername = 'admin_vasileios'
  const adminFullName = process.env.FULL_NAME

  // Sign up the admin user
  const { data, error } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        username: adminUsername,
        full_name: adminFullName,
      },
    },
  })

  if (error) {
    if (error.message?.includes('already registered')) {
      return { message: 'Admin user already exists.', created: false }
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create admin: ${error.message}`,
    })
  }

  return {
    message: 'Admin user created! Check your email to confirm, then log in.',
    created: true,
    userId: data.user?.id,
  }
})
