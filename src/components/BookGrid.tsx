import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { motion } from 'framer-motion';

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  file_url: string;
}

interface BookGridProps {
  books: Book[];
}

export function BookGrid({ books }: BookGridProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <div className="p-6">
      {selectedBook ? (
        <div className="relative">
          <button
            onClick={() => setSelectedBook(null)}
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
          <iframe
            src={selectedBook.file_url}
            className="w-full h-screen"
            title={selectedBook.title}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <motion.div
              key={book.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={book.cover_url || 'https://via.placeholder.com/150'} // Fallback for missing cover
                alt={book.title || 'Untitled'}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{book.title || 'Untitled'}</h3>
                <button
                  onClick={() => setSelectedBook(book)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  View PDF
                </button>
                {book.file_url && <QRCode value={book.file_url} size={64} className="mt-4" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}