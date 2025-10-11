import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
      <div className="m-auto sm:w-full lg:w-3/5 mt-12">
        <div className="max-w-none leading-none whitespace-pre-wrap">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ children }) => <p className="leading-relaxed my-0">{children}</p>,
              em: ({ children }) => <em className="italic">{children}</em>,
              small: ({ children }) => <small className="text-sm text-gray-500">{children}</small>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-700 mt-5 mb-2">{children}</h3>,
              h4: ({ children }) => <h4 className="text-lg font-medium text-gray-700 mt-4 mb-2">{children}</h4>,
              h5: ({ children }) => <h5 className="text-base font-medium text-gray-600 mt-3 mb-2">{children}</h5>,
              h6: ({ children }) => <h6 className="text-sm font-medium text-gray-600 mt-3 mb-2">{children}</h6>,
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="font-semibold text-sky-600"
                >
                  {props.children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-6 my-0 leading-none">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-6 mb-0">{children}</ol>
              ),
              li: ({ children }) => <li className="!m-0">{children}</li>,
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
