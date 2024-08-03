import './App.css';
import QuoteParser from './QuoteParser';
import { useParams } from 'react-router';

export default function QuotePage() {

  const { id } = useParams();
  const quoteId: string = id!;
  const quote = QuoteParser.getQuote(quoteId);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-3xl w-full mx-4 transition-all duration-300 hover:shadow-xl">
        <blockquote className="sm:text-xl font-mono font-semibold text-gray-800 mb-6 leading-relaxed whitespace-pre-line">
          <em>{quote.quote}</em>
        </blockquote>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <cite className="text-xl font-medium text-gray-600 not-italic mb-2 sm:mb-0">
            — {quote.author}
          </cite>
          <div className="text-sm text-gray-500">
            <p><em>{quote.context}</em></p>
            <p>Archived {quote.date.toDateString()}</p>
          </div>
        </div>
        {quote.tags && quote.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {quote.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
