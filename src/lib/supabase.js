
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.https://mizrchqjvxhrgwbydmvd.supabase.co
const key = import.meta.env.sb_publishable_lKiTVwsJgLX8uBckUT6YLQ_bfa2wb30

export const isSupabaseConfigured = Boolean(
  url && key &&
  !url.includes('YOUR_PROJECT_ID') &&
  !key.includes('your_supabase')
)

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : null
