import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("⚠️  VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están seteadas. La persistencia no funcionará.");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");
