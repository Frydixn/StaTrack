// Supabase se maneja desde el backend proxy (statrack-backend).
// Este archivo ya no inicializa ningún cliente de Supabase.
// Existe para no romper imports mientras se migra el código.
export const supabase = null;
