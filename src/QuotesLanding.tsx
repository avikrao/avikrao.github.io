import { useNavigate } from 'react-router-dom';
import QuoteParser from './QuoteParser';

const QuotesLanding = () => {
  const navigate = useNavigate();

  const goToRandomQuote = () => {
    const quote = QuoteParser.getRandomQuote();
    navigate(`/quote/${quote.slug}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Quotes</h2>
        <p className="text-xl text-gray-600 mb-8">
          You'll have to take a random quote. Letting you see them all at once would be too easy, wouldn't it?
        </p>
        <button
          onClick={goToRandomQuote}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Gimme a quote!
        </button>
        <p className='text-xs m-8 text-slate-400'>
          If you <em>really</em> want to see them all, you can find all the quotes obfuscated via base-64 encoding on my GitHub.
        </p>
      </div>
    </div>
  );
};

export default QuotesLanding;
