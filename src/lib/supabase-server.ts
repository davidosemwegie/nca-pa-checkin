import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oeouovzsxkspjpmrwvrx.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;

// Server-side Supabase client with service role key for admin operations
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
