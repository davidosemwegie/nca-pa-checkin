import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oeouovzsxkspjpmrwvrx.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window?.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
