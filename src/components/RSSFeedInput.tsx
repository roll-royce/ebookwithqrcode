import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../types/Book';

interface RSSFeedInputProps {
  onBooksLoaded: (books: Book[]) => void;
}

export function RSSFeedInput({ onBooksLoaded }: RSSFeedInputProps) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${url}`);
      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error('Failed to fetch RSS feed');
      }

      const items = data.items;
      const books: Book[] = items.map((item: any) => ({
        title: item.title || 'Untitled',
        author: item.author || 'Unknown',
        description: item.description || '',
        link: item.link || '#',
        cover_url: item.enclosure?.url || 
                 item.image?.url ||
                 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=300' // Default cover
      }));

      // Validate `file_url` before inserting
      const { error: dbError } = await supabase
        .from('ebooks_books')
        .insert(
          books.map((book: Book) => ({
            title: book.title,
            author: book.author,
            description: book.description,
            file_url: book.link.startsWith('http') ? book.link : null, // Validate URL
            cover_url: book.cover_url
          }))
        );

      if (dbError) {
        throw new Error(`Database insertion failed: ${dbError.message}`);
      }

      onBooksLoaded(books);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch RSS feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="RSS Feed URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading ? 'Loading...' : 'Add Books'}
        </button>
      </form>
    </div>
  );
}