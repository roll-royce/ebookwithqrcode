-- Create the `ebooks_books` table
CREATE TABLE IF NOT EXISTS public.ebooks_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security (RLS) on the `ebooks_books` table
ALTER TABLE public.ebooks_books ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.ebooks_books;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.ebooks_books;

-- Create a policy to allow anyone to insert books
CREATE POLICY "Allow insert for anyone" ON public.ebooks_books
  FOR INSERT
  WITH CHECK (true);

-- Create a policy to allow anyone to select books
CREATE POLICY "Allow select for anyone" ON public.ebooks_books
  FOR SELECT
  USING (true);

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebooks_books TO anon, authenticated;