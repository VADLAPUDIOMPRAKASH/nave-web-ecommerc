import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiFilter, FiX } from 'react-icons/fi';
import { BsGrid, BsList } from 'react-icons/bs';
import Filter from '../../components/filter/Filter';
import Layout from '../../components/layout/Layout';
import myContext from '../../context/data/myContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';

function Allproducts() {
    const context = useContext(myContext);
    const { mode, product, searchkey, setSearchkey } = context;
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [favorites, setFavorites] = useState([]);

    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);

    const addCart = (product) => {
        dispatch(addToCart(product));
        toast.success('Added to cart');
    };

    const toggleFavorite = (productId) => {
        setFavorites(prev => 
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Calculate discount percentage
    const calculateDiscount = (actualPrice, price) => {
        const discount = ((actualPrice - price) / actualPrice) * 100;
        return Math.round(discount);
    };

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Get unique categories
    const categories = ['all', ...new Set(product.map(item => item.category))];

    // Filter and sort products
    const filteredAndSortedProducts = product
        .filter((obj) => {
            const matchesSearch = obj.title.toLowerCase().includes(searchkey.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || obj.category === selectedCategory;
            const matchesPriceRange = obj.price >= priceRange[0] && obj.price <= priceRange[1];
            return matchesSearch && matchesCategory && matchesPriceRange;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'discount':
                    return calculateDiscount(b.actualprice, b.price) - calculateDiscount(a.actualprice, a.price);
                default:
                    return 0;
            }
        });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <Layout>
            <Filter />
            <section className="text-gray-600 body-font min-h-screen">
                <div className="container px-4 py-6 md:py-12 mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-4 md:mb-0"
                        >
                            <h1 
                                className="sm:text-3xl text-2xl font-bold mb-2"
                                style={{ color: mode === 'dark' ? 'white' : 'gray-900' }}
                            >
                                Discover Fresh Products
                            </h1>
                            <div className="h-1 w-20 bg-green-500 rounded"></div>
                        </motion.div>

                        {/* Controls Section */}
                        <div className="flex flex-wrap items-center gap-4">
                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${
                                        viewMode === 'grid'
                                            ? 'bg-white dark:bg-gray-700 shadow-sm'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <BsGrid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${
                                        viewMode === 'list'
                                            ? 'bg-white dark:bg-gray-700 shadow-sm'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <BsList className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Filter Button (Mobile) */}
                            <button
                                onClick={() => setShowFilters(true)}
                                className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                            >
                                <FiFilter className="w-5 h-5" />
                                Filters
                            </button>

                            {/* Desktop Filters */}
                            <div className="hidden md:flex items-center gap-4">
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-400 ${
                                        mode === 'dark'
                                            ? 'bg-gray-800 text-white border-gray-700'
                                            : 'bg-white text-gray-700 border-gray-200'
                                    }`}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>

                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-400 ${
                                        mode === 'dark'
                                            ? 'bg-gray-800 text-white border-gray-700'
                                            : 'bg-white text-gray-700 border-gray-200'
                                    }`}
                                >
                                    <option value="default">Sort by</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="discount">Highest Discount</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters Modal */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.95 }}
                                    className={`w-full max-w-sm rounded-lg p-6 ${
                                        mode === 'dark' ? 'bg-gray-800' : 'bg-white'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Filters</h3>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                        >
                                            <FiX className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Category</label>
                                            <select 
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border bg-transparent"
                                            >
                                                {categories.map(category => (
                                                    <option key={category} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Sort By</label>
                                            <select 
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border bg-transparent"
                                            >
                                                <option value="default">Sort by</option>
                                                <option value="price-low">Price: Low to High</option>
                                                <option value="price-high">Price: High to Low</option>
                                                <option value="discount">Highest Discount</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="5000"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="w-full mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        Apply Filters
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Products Grid/List */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={viewMode === 'grid' 
                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                            : "space-y-4"
                        }
                    >
                        {filteredAndSortedProducts.map((item) => {
                            const { title, price, imageUrl, id, actualprice } = item;
                            const discountPercentage = calculateDiscount(actualprice, price);
                            const isFavorite = favorites.includes(id);

                            return (
                                <motion.div
                                    key={id}
                                    variants={itemVariants}
                                    className={`relative group cursor-pointer ${
                                        viewMode === 'list' ? 'flex gap-4' : ''
                                    }`}
                                    onClick={() => window.location.href = `/productinfo/${id}`}
                                >
                                    <div 
                                        className={`relative overflow-hidden rounded-lg border ${
                                            mode === 'dark' 
                                                ? 'bg-gray-800 border-gray-700' 
                                                : 'bg-white border-gray-200'
                                        } hover:shadow-lg transition-all duration-300 ${
                                            viewMode === 'list' ? 'flex-shrink-0 w-40 h-40' : 'h-full'
                                        }`}
                                    >
                                        {/* Image Container */}
                                        <div className={`relative ${viewMode === 'list' ? 'h-full' : 'pt-[100%]'}`}>
                                            <img
                                                className="absolute inset-0 w-full h-full object-cover p-1.5 rounded-lg 
                                                         group-hover:scale-105 transition-transform duration-300"
                                                src={imageUrl}
                                                alt={title}
                                            />
                                            {/* Discount Badge */}
                                            {discountPercentage > 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                                                    {discountPercentage}% OFF
                                                </div>
                                            )}
                                            {/* Favorite Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(id);
                                                }}
                                                className={`absolute top-2 left-2 p-1.5 rounded-full transition-all duration-300 ${
                                                    isFavorite 
                                                        ? 'bg-red-500 text-white' 
                                                        : 'bg-white/80 backdrop-blur-sm hover:bg-white'
                                                }`}
                                            >
                                                <FiHeart 
                                                    className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} 
                                                />
                                            </button>
                                        </div>
                                        
                                        {/* Content Container */}
                                        <div className={`p-2 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                                            <h2 className="text-[10px] font-medium mb-0.5 text-green-600">
                                                {item.category}
                                            </h2>
                                            <h1 
                                                className={`text-xs font-medium mb-1 ${
                                                    viewMode === 'list' ? '' : 'truncate'
                                                }`}
                                                style={{ color: mode === 'dark' ? 'white' : '' }}
                                            >
                                                {title}
                                            </h1>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <p className="text-xs font-bold text-green-600">
                                                    ₹{price}
                                                </p>
                                                <p className="text-[10px] text-gray-500 line-through">
                                                    ₹{actualprice}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addCart(item);
                                                }}
                                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 
                                                         bg-green-500 text-white rounded text-xs hover:bg-green-600 
                                                         transition-colors duration-300"
                                            >
                                                <FiShoppingCart className="w-3 h-3" />
                                                Add To Cart
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Empty State */}
                    {filteredAndSortedProducts.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <FiFilter className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 
                                className="text-xl font-medium mb-2" 
                                style={{ color: mode === 'dark' ? 'white' : '' }}
                            >
                                No products found
                            </h2>
                            <p className="text-gray-400">
                                Try adjusting your search or filter criteria
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSortBy('default');
                                    setSearchkey('');
                                    setPriceRange([0, 5000]);
                                }}
                                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                            >
                                Reset Filters
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>
        </Layout>
    );
}

export default Allproducts;