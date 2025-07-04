import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import myContext from '../../context/data/myContext';
import './HeroSection.css';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const context = useContext(myContext);
  const { mode, searchkey, setSearchkey, product } = context;
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchkey.trim()) {
      window.location.href = '/allproducts';
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };
  const clearSearch = () => {
    setSearchkey('');
    setShowSuggestions(false);
  };

  // Filtered suggestions
  const suggestions = searchkey.trim()
    ? product.filter(p =>
        p.title.toLowerCase().includes(searchkey.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden" style={{background: 'linear-gradient(120deg, #ffb6d5 0%, #b2f7cc 60%, #a5b4fc 100%)'}}>
      {/* Stronger pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{background: 'radial-gradient(circle at 20% 40%, #fff0f6 20%, transparent 70%), radial-gradient(circle at 80% 60%, #e0f2fe 20%, transparent 80%)'}} />
          <motion.div
        initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        className="w-full max-w-2xl mx-auto text-center relative z-10"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-pink-500 via-green-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
          Freshness Delivered, <span className="text-pink-600">Every Day</span>
              </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-8 font-medium">
          Empowering farmers. Enjoy the best quality vegetables and leafy greens, delivered to your doorstep.
        </p>
        <div className="mb-6 max-w-md mx-auto relative">
          <div className="relative rounded-full bg-white shadow-lg border border-gray-200 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchkey}
              onChange={(e) => { setSearchkey(e.target.value); setShowSuggestions(true); }}
              onKeyUp={handleSearch}
                  placeholder="Search for fresh vegetables..."
              className="block w-full pl-12 pr-10 py-3 rounded-full text-base outline-none bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-pink-200"
              autoComplete="off"
              onFocus={() => setShowSuggestions(true)}
            />
            {searchkey && (
              <button onClick={clearSearch} className="absolute right-3 text-gray-400 hover:text-pink-500">
                <X className="w-5 h-5" />
              </button>
            )}
              </div>
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-72 overflow-y-auto">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer transition-all border-b last:border-b-0"
                  onClick={() => {
                    navigate(`/productinfo/${item.id}`);
                    setShowSuggestions(false);
                  }}
                >
                  <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate">{item.category}</div>
                  </div>
                  <div className="font-bold text-green-600 text-sm">₹{item.price}</div>
                </div>
              ))}
            </div>
          )}
            </div>
          </motion.div>
    </div>
  );
}

export default HeroSection;
