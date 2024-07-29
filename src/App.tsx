import { NavLink, Route, Routes, HashRouter } from 'react-router-dom';
import Home from './Home';
import QuotePage from './QuotePage';

const App = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-bold text-gray-800">Avik's Excerpts</h1>
              <div className="hidden sm:flex space-x-4 mx-auto">
                {['Home', 'Quotes', 'Blog', 'Miscellaneous'].map((tab) => (
                  <NavLink
                    key={tab}
                    to={tab === 'Home' ? '/' : `/${tab.toLowerCase()}`}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-blue-100'
                      }`
                    }
                  >
                    {tab}
                  </NavLink>
                ))}
              </div>
              <div className="sm:hidden">
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => window.location.hash = e.target.value}
                >
                  <option value="/">Home</option>
                  <option value="/quotes">Quotes</option>
                  <option value="/blog">Blog</option>
                  <option value="/miscellaneous">Miscellaneous</option>
                </select>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quote/:id" element={<QuotePage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/miscellaneous" element={<Miscellaneous />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const Blog = () => <p className="text-lg">Welcome to our blog section.</p>;
const Miscellaneous = () => <p className="text-lg">Miscellaneous content goes here.</p>;

export default App;
