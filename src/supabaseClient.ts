import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uebxjqrdndklgpzpskie.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlYnhqcXJkbmRrbGdwenBza2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDA0ODMsImV4cCI6MjA2OTQ3NjQ4M30.B6s1Qrh2T6k6PRCs9BjxCtXdcg9xv1V7Jk_Za7WyQMk";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
