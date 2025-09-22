import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { loadThoughtBySlug, ThoughtPost } from './ThoughtLoader';

const MarkdownPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ThoughtPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError('No post slug provided');
        setLoading(false);
        return;
      }

      try {
        const thoughtPost = await loadThoughtBySlug(slug);
        if (!thoughtPost) {
          setError('Post not found');
        } else {
          setPost(thoughtPost);
        }
      } catch (err) {
        setError('Failed to load post');
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-red-600">{error || 'Post not found'}</div>
      </div>
    );
  }

  return (
    <div className="justify-center">
      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-gray-800">{post.meta.title}</h1>
        <h2 className="text-xl mt-3 text-gray-600">{post.meta.date}</h2>
      </div>
      <div className="m-auto sm:w-full lg:w-3/5 mt-20">
        <div className="prose prose-lg max-w-none leading-8 whitespace-pre-wrap">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p>{children}</p>,
              em: ({ children }) => <em className="italic">{children}</em>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              a: ({ node, ...props }) => (
                <a 
                  {...props}
                  className="font-semibold text-sky-600"
                >
                  {props.children}
                </a>
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPost;
