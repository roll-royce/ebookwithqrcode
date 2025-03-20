/*
  # Create E-books Database Schema

  1. New Tables
    - `ebooks_books`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `author` (text, optional)
      - `description` (text, optional)
      - `file_url` (text, required, unique)
      - `cover_url` (text, optional)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `ebooks_books` table
    - Add policies for public access

  3. Storage
    - Create a public storage bucket for e-books
    - Add policies for public access to the storage bucket
*/

-- Create the `ebooks_books` table
CREATE TABLE IF NOT EXISTS ebooks_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique identifier for each book
  title TEXT NOT NULL, -- Title of the book
  author TEXT, -- Author of the book (optional)
  description TEXT, -- Description of the book (optional)
  file_url TEXT NOT NULL UNIQUE, -- URL of the uploaded file (must be unique)
  cover_url TEXT, -- URL of the book cover (optional)
  created_at TIMESTAMPTZ DEFAULT now(), -- Timestamp when the record was created
  updated_at TIMESTAMPTZ DEFAULT now() -- Timestamp when the record was last updated
);

-- Enable Row-Level Security (RLS) on the `ebooks_books` table
ALTER TABLE ebooks_books ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access" ON ebooks_books;
  DROP POLICY IF EXISTS "Allow public insert" ON ebooks_books;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access"
  ON ebooks_books
  FOR SELECT
  TO public
  USING (true);

-- Create a policy to allow public insert access
CREATE POLICY "Allow public insert"
  ON ebooks_books
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a storage bucket for e-books if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing policies for the storage bucket to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public access to ebooks storage" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create a policy to allow public access to the `ebooks` storage bucket
CREATE POLICY "Allow public access to ebooks storage"
  ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'ebooks');