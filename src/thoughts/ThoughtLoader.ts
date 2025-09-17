import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Make Buffer available globally for gray-matter
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
} else if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
}

export interface ThoughtPostMeta {
  title: string;
  description: string;
  date: string;
  image?: string;
  urlSlug: string;
}

export interface ThoughtPost {
  meta: ThoughtPostMeta;
  content: string;
}

// List of markdown files in the public/thoughts directory
const markdownFiles = [
  'reflecting-on-self-reflection.md',
  'trickle-down-culture.md',
];

export const loadAllThoughts = async (): Promise<ThoughtPost[]> => {
  const thoughts: ThoughtPost[] = [];

  for (const fileName of markdownFiles) {
    try {
      // Fetch the markdown content from public directory
      const response = await fetch(`/thoughts/${fileName}`);
      if (!response.ok) {
        console.warn(`Failed to fetch ${fileName}: ${response.statusText}`);
        continue;
      }
      
      const markdownContent = await response.text();
      const { data: meta, content } = matter(markdownContent);
      
      // Validate that all required meta fields are present
      if (!meta.title || !meta.description || !meta.date || !meta.urlSlug) {
        console.warn(`Missing required metadata in ${fileName}`);
        continue;
      }

      thoughts.push({
        meta: meta as ThoughtPostMeta,
        content
      });
    } catch (error) {
      console.error(`Error loading markdown file ${fileName}:`, error);
    }
  }

  // Sort by date (most recent first)
  return thoughts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
};

export const loadThoughtBySlug = async (slug: string): Promise<ThoughtPost | null> => {
  const thoughts = await loadAllThoughts();
  return thoughts.find(thought => thought.meta.urlSlug === slug) || null;
};
