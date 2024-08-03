import React from 'react';
import { Link } from 'react-router-dom';

import * as ThoughtPosts from './thoughts/ThoughtPost';

const ThoughtLanding = () => {
  const thoughtPosts = Object.values(ThoughtPosts);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Thoughts</h1>
      <p className="text-lg text-gray-600 mb-8 whitespace-pre-line leading-7">
        Random thoughts I have. Could be short (don't be surprised if you find a one-liner), or they could be essays.
      </p>
      <div className="space-y-6">
        {thoughtPosts.map((PostComponent, index) => (
          <Link key={index} to={`/thought/${PostComponent.urlSlug}`} className="block">
            <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex">
                {PostComponent.image && (
                  <div className="flex-shrink-0 w-36">
                    <img 
                      className="h-full w-full object-cover" 
                      src={PostComponent.image} 
                      alt={PostComponent.title}
                    />
                  </div>
                )}
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{PostComponent.title}</h2>
                  <p className="text-gray-600 mb-4">{PostComponent.description}</p>
                  <p className="text-sm text-gray-500">{new Date(PostComponent.date).toLocaleDateString()}</p>
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
