import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { BookModel } from './components/BookModel';
import { RSSFeedInput } from './components/RSSFeedInput';
import { BookUpload } from './components/BookUpload';
import { BookGrid } from './components/BookGrid';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Book } from './types/Book';
import { findMax } from './utils/dsa';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const numbers = [1, 2, 3, 4, 5];
  const maxNumber = findMax(numbers);
  console.log('Maximum number:', maxNumber);

  const handleBookUploaded = (newBook: Book) => {
    setBooks((prevBooks) => [...prevBooks, newBook]); // Append the new book
  };

  const handleBooksLoaded = (newBooks: Book[]) => {
    setBooks((prevBooks) => [...prevBooks, ...newBooks]); // Append the new books
  };

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase.from('ebooks_books').select('*');
      if (error) {
        console.error('Error fetching books:', error);
      } else {
        setBooks(data || []);
      }
    };

    fetchBooks();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between">
            <h1 className="text-xl font-bold">Digital Library Hub</h1>
            <div className="space-x-4">
              <Link to="/" className="hover:underline">Browse Books</Link>
              <Link to="/rss" className="hover:underline">Add RSS Feed</Link>
              <Link to="/upload" className="hover:underline">Upload Book</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative h-[60vh] bg-gradient-to-br from-blue-600 to-purple-700 overflow-hidden">
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={null}>
                <BookModel />
              </Suspense>
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
          
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Digital Library Hub
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Your gateway to a world of digital books. Upload, share, and discover
                new reads with our modern e-book repository.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<BookGrid books={books} />} />
          <Route path="/rss" element={<RSSFeedInput onBooksLoaded={handleBooksLoaded} />} />
          <Route path="/upload" element={<BookUpload onBookUploaded={handleBookUploaded} />} />
        </Routes>
        <div>
          <h1>Maximum number: {maxNumber}</h1>
        </div>
      </div>
    </Router>
  );
}

export default App;