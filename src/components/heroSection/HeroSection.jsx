import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Leaf, Truck, Clock, ShoppingBag } from 'lucide-react';
import myContext from '../../context/data/myContext';
import './HeroSection.css';
import logo from '../../assets/NavedhanaLogo.png';

function HeroSection() {
  const context = useContext(myContext);
  const { mode, searchkey, setSearchkey } = context;
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchkey.trim()) {
      navigate('/allproducts');
    }
  };

  return (
    <div className="relative pt-8 lg:pt-12 min-h-[calc(100vh-72px)] lg:min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#00c867_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
      </div>

      {/* Content Container */}
      <div className="w-full container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                <span className="block mb-1">Fresh Vegetables,</span>
                <span className="text-green-600">Delivered Today</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Same Day Harvest</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Quick Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Fresh Products</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-xl mx-auto lg:mx-0">
              Lets Empower farmers, Enjoy Freshness, Eliminate waste
            </p>

            {/* Search Bar */}
            <div className="mb-4 sm:mb-6 max-w-md mx-auto lg:mx-0">
              <div className={`relative rounded-full transition-all duration-300 ${
                mode === 'dark' 
                  ? 'bg-gray-800 shadow-lg shadow-gray-700/20 border border-gray-700' 
                  : 'bg-white shadow-lg shadow-gray-200/20 border border-gray-200'
              }`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-4 w-4 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  type="text"
                  value={searchkey}
                  onChange={(e) => setSearchkey(e.target.value)}
                  onKeyPress={handleSearch}
                  placeholder="Search for fresh vegetables..."
                  className={`block w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition-all duration-300 ${
                    mode === 'dark'
                      ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20'
                      : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500/20'
                  }`}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-square w-full max-w-xl mx-auto">
              {/* Rotating Text */}
              <div className="absolute inset-0 w-full h-full animate-spin-slow">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none">
                  <defs>
                    <path 
                      id="circlePath" 
                      d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" 
                      className="stroke-none"
                    />
                  </defs>
                  <text className={`${mode === 'dark' ? 'fill-gray-300' : 'fill-gray-600'} select-none`}>
                    <textPath 
                      href="#circlePath" 
                      className="text-[7px] xs:text-[8px] sm:text-[9px] tracking-[0.2em]"
                      startOffset="0%"
                      spacing="auto"
                    >
                      • HARVESTED TODAY, DELIVERY TODAY •
                    </textPath>
                  </text>
                </svg>
              </div>

              <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 scale-95"></div>
              <img
                src={logo}
                alt="Fresh Vegetables"
                className="absolute inset-0 w-[75%] h-[75%] m-auto object-contain mix-blend-multiply dark:mix-blend-normal"
              />
              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute top-1/4 -left-6 w-12 sm:w-16 h-12 sm:h-16 bg-yellow-400 rounded-full opacity-20"
              />
              <motion.div
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute bottom-1/4 -right-4 w-14 sm:w-20 h-14 sm:h-20 bg-green-400 rounded-full opacity-20"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
