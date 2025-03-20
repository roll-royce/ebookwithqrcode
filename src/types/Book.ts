export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  file_url: string;
  link?: string; // Add the link property
}