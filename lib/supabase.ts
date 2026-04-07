import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  summary: string | null;
  amazon_url: string | null;
  recommender: string;
  note: string | null;
  created_at: string;
}
