import { createClient } from '@supabase/supabase-js';

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

// Create client if configured, otherwise create a mock-safe instance
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const getSupabaseConfigStatus = () => {
  return {
    configured: isSupabaseConfigured(),
    url: supabaseUrl || 'Not configured (using local IndexedDB)',
    message: isSupabaseConfigured()
      ? 'Supabase Cloud PostgreSQL connected.'
      : 'Supabase credentials not configured in .env. Running in offline-first IndexedDB mode.',
  };
};
