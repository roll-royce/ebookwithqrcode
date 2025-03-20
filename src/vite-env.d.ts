/// <reference types="vite/client" />

// Declare environment variables for Vite
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string; // Supabase URL
  readonly VITE_SUPABASE_ANON_KEY: string; // Supabase Anon Key
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
