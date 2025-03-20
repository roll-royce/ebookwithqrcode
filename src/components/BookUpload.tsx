import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Book } from '../types/Book';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface BookUploadProps {
  onBookUploaded: (book: Book) => void;
}

export function BookUpload({ onBookUploaded }: BookUploadProps) {
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');

  const extractCoverFromPDF = async (file: File): Promise<string | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error extracting cover:', error);
      return null;
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!file) {
        throw new Error('No file selected');
      }

      let coverUrl: string | null = null; // Define coverUrl
      if (file.type === 'application/pdf') {
        coverUrl = await extractCoverFromPDF(file); // Use the function here
      } else {
        coverUrl = 'https://via.placeholder.com/150'; // Default cover for non-PDF files
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: fileError } = await supabase.storage
        .from('ebooks')
        .upload(fileName, file); // Remove fileData if unused

      if (fileError) {
        throw new Error(`File upload failed: ${fileError.message}`);
      }

      const { publicUrl } = supabase.storage
        .from('ebooks')
        .getPublicUrl(fileName).data;

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      setQrCode(publicUrl); // Add this line after generating the public URL

      // Insert metadata into the database
      const { data: book, error: dbError } = await supabase
        .from('ebooks_books')
        .insert([{
          title: file.name,
          author: name,
          file_url: publicUrl,
          cover_url: coverUrl, // Use the defined coverUrl
        }])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database insertion failed: ${dbError.message}`);
      }

      // Notify parent component
      onBookUploaded({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        cover_url: book.cover_url,
        file_url: book.file_url,
      });
    } catch (error) {
      console.error('Error uploading book:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex items-center space-x-2">
          <Upload className="text-blue-600" />
          <h3 className="text-lg font-semibold">Upload E-Book</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="text-gray-500" size={20} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
            accept=".pdf,.epub,.mobi"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? 'Uploading...' : 'Upload Book'}
        </button>
      </form>

      {qrCode && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code for your book:</h4>
          <QRCodeSVG value={qrCode} size={128} className="mx-auto" />
        </div>
      )}
    </div>
  );
}