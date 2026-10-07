const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@safwa.com',
    password: 'password123',
    email_confirm: true
  })

  if (error) {
    console.error('Gagal membuat user:', error.message)
  } else {
    console.log('User berhasil dibuat!')
    console.log('Email: admin@safwa.com')
    console.log('Password: password123')
  }
}

createUser()
