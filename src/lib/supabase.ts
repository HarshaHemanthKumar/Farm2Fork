import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment, then restart the app.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}
