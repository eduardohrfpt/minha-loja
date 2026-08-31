import { createClient } from '@supabase/supabase-js'

// Cliente com a service role key: só deve ser usado em código server-side (pasta /api),
// nunca exposto ao navegador. Ele ignora RLS, então cada function precisa validar
// explicitamente o que o usuário tem permissão de fazer.
export function criarSupabaseAdmin() {
  return createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
