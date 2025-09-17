import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { loadAllThoughts, ThoughtPost } from './thoughts/ThoughtLoader';

const ThoughtLanding = () => {
  const [thoughts, setThoughts] = useState<ThoughtPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadThoughts = async () => {
      try {
        const allThoughts = await loadAllThoughts();
        setThoughts(allThoughts);
      } catch (error) {
        console.error('Error loading thoughts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThoughts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thoughts</h1>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-gray-600">Loading thoughts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Thoughts</h1>
      <p className="text-lg text-gray-600 mb-8 whitespace-pre-line leading-7">
        Random thoughts I have. Could be short (don't be surprised if you find a one-liner), or they could be essays.
      </p>
      <div className="space-y-6">
        {thoughts.map((thought, index) => (
          <Link key={index} to={`/thought/${thought.meta.urlSlug}`} className="block">
            <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex">
                {thought.meta.image && (
                  <div className="flex-shrink-0 w-36">
                    <img 
                      className="h-full w-full object-cover" 
                      src={thought.meta.image} 
                      alt={thought.meta.title}
                    />
                  </div>
                )}
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{thought.meta.title}</h2>
                  <p className="text-gray-600 mb-4">{thought.meta.description}</p>
                  <p className="text-sm text-gray-500">{thought.meta.date}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ThoughtLanding;
