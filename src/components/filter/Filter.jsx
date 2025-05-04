import React, { useContext, useState, useEffect } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import myContext from '../../context/data/myContext'
import { useNavigate } from 'react-router-dom'

function Filter() {
    const context = useContext(myContext)
    const { mode, searchkey, setSearchkey, product } = context
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [recentSearches, setRecentSearches] = useState([])
    const navigate = useNavigate()

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches')
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
    }, [])

    // Save recent searches to localStorage
    const addToRecentSearches = (term) => {
        const updated = [term, ...recentSearches.filter(item => item !== term)].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
    }

    // Handle search suggestions
    useEffect(() => {
        if (searchkey.trim()) {
            const filtered = product?.filter(item =>
                item.title.toLowerCase().includes(searchkey.toLowerCase()) ||
                item.category.toLowerCase().includes(searchkey.toLowerCase())
            ).slice(0, 5)
            setSuggestions(filtered || [])
            setShowSuggestions(true)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [searchkey, product])

    // Handle search submission
    const handleSearch = (term) => {
        if (term.trim()) {
            addToRecentSearches(term)
            setSearchkey(term)
            setShowSuggestions(false)
            navigate('/allproducts')
        }
    }

    // Clear search
    const clearSearch = () => {
        setSearchkey('')
        setShowSuggestions(false)
    }

    return (
        <div className='container mx-auto px-4 pt-24'>
            <div className={`relative max-w-2xl mx-auto ${showSuggestions ? 'mb-4' : ''}`}>
                {/* Search Input */}
                <div className={`relative rounded-full transition-all duration-300 ${
                    mode === 'dark' 
                        ? 'bg-gray-800 shadow-lg shadow-gray-700/20 border border-gray-700' 
                        : 'bg-white shadow-lg shadow-gray-200/20 border border-gray-200'
                }`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiSearch className={`h-5 w-5 ${
                            mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                    </div>
                    <input
                        type="text"
                        value={searchkey}
                        onChange={(e) => setSearchkey(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchkey)}
                        placeholder="Search for products..."
                        className={`block w-full pl-12 pr-12 py-3 rounded-full text-sm outline-none transition-all duration-300 ${
                            mode === 'dark'
                                ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20'
                                : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500/20'
                        }`}
                    />
                    {searchkey && (
                        <button
                            onClick={clearSearch}
                            className={`absolute inset-y-0 right-0 pr-4 flex items-center ${
                                mode === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                            } transition-colors duration-200`}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Search Suggestions Dropdown */}
                <AnimatePresence>
                    {showSuggestions && (searchkey.trim() || recentSearches.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute w-full rounded-lg shadow-lg ${
                                mode === 'dark' 
                                    ? 'bg-gray-800 border border-gray-700' 
                                    : 'bg-white border border-gray-100'
                            }`}
                        >
                            {/* Product Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="py-2">
                                    <h3 className={`px-4 py-2 text-xs font-semibold ${
                                        mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        SUGGESTIONS
                                    </h3>
                                    {suggestions.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearch(item.title)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                                mode === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title}
                                                    className="w-8 h-8 object-cover rounded-md mr-3"
                                                />
                                                <div>
                                                    <p className="font-medium">{item.title}</p>
                                                    <p className={`text-xs ${
                                                        mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                        {item.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && !searchkey.trim() && (
                                <div className="py-2">
                                    <h3 className={`px-4 py-2 text-xs font-semibold ${
                                        mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        RECENT SEARCHES
                                    </h3>
                                    {recentSearches.map((term, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearch(term)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                                mode === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <FiSearch className="w-4 h-4 mr-3 opacity-50" />
                                                {term}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {searchkey.trim() && suggestions.length === 0 && (
                                <div className={`px-4 py-6 text-center ${
                                    mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    <p className="text-sm">No results found for "{searchkey}"</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Filter