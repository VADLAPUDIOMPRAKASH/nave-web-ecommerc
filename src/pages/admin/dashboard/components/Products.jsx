import React, { useContext, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, List, Grid3X3, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import myContext from '../../../../context/data/myContext';

const Products = () => {
    const context = useContext(myContext);
    const { product, deleteProduct, updateProduct } = context;
    const [editingPrice, setEditingPrice] = useState(null);
    const [editingPriceValue, setEditingPriceValue] = useState('');
    const [editingActualPriceValue, setEditingActualPriceValue] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');
    const [productPriceFilter, setProductPriceFilter] = useState('all');
    const [productSortBy, setProductSortBy] = useState('name');
    const [productSortOrder, setProductSortOrder] = useState('asc');
    const [productShowFilters, setProductShowFilters] = useState(false);
    const [productViewMode, setProductViewMode] = useState('list');

    const handlePriceEdit = (item) => {
        setEditingPrice(item.id);
        setEditingPriceValue(item.price.toString());
        setEditingActualPriceValue(item.actualprice ? item.actualprice.toString() : '');
    };

    const handlePriceSave = async (item) => {
        const fullProduct = product.find(p => p.id === item.id);
        if (!fullProduct) {
            toast.error('Product not found');
            return;
        }
        if (editingActualPriceValue && parseFloat(editingActualPriceValue) < parseFloat(editingPriceValue)) {
            toast.error('Original price (MRP) should be greater than or equal to selling price.');
            return;
        }
        const updatedProduct = {
            ...fullProduct,
            price: parseFloat(editingPriceValue),
            actualprice: editingActualPriceValue ? parseFloat(editingActualPriceValue) : undefined
        };
        await updateProduct(updatedProduct);
        setEditingPrice(null);
        setEditingPriceValue('');
        setEditingActualPriceValue('');
    };

    const handlePriceCancel = () => {
        setEditingPrice(null);
        setEditingPriceValue('');
        setEditingActualPriceValue('');
    };

    const getFilteredAndSortedProducts = () => {
        let filteredProducts = [...product];

        if (productSearchQuery.trim()) {
            const query = productSearchQuery.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                (product.title || '').toLowerCase().includes(query) ||
                (product.category || '').toLowerCase().includes(query) ||
                (product.description || '').toLowerCase().includes(query) ||
                (product.price ? product.price.toString() : '').includes(query)
            );
        }

        if (productCategoryFilter !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === productCategoryFilter
            );
        }

        if (productPriceFilter !== 'all') {
            filteredProducts = filteredProducts.filter(product => {
                const price = parseFloat(product.price) || 0;
                if (productPriceFilter === 'low') return price < 50;
                if (productPriceFilter === 'medium') return price >= 50 && price < 100;
                if (productPriceFilter === 'high') return price >= 100;
                return true;
            });
        }

        filteredProducts.sort((a, b) => {
            let aValue, bValue;

            switch (productSortBy) {
                case 'name':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    break;
                case 'price':
                    aValue = parseFloat(a.price) || 0;
                    bValue = parseFloat(b.price) || 0;
                    break;
                case 'category':
                    aValue = (a.category || '').toLowerCase();
                    bValue = (b.category || '').toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.date || 0);
                    bValue = new Date(b.date || 0);
                    break;
                default:
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
            }

            if (productSortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filteredProducts;
    };

    const clearAllProductFilters = () => {
        setProductSearchQuery('');
        setProductCategoryFilter('all');
        setProductPriceFilter('all');
        setProductSortBy('name');
        setProductSortOrder('asc');
    };

    const getActiveProductFiltersCount = () => {
        let count = 0;
        if (productSearchQuery.trim()) count++;
        if (productCategoryFilter !== 'all') count++;
        if (productPriceFilter !== 'all') count++;
        return count;
    };

    const filteredProducts = getFilteredAndSortedProducts();

    return (
        <div className="space-y-6">
            {/* Header with Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {filteredProducts.length} products
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setProductViewMode('list')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                    productViewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setProductViewMode('card')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                    productViewMode === 'card'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setProductShowFilters(!productShowFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                productShowFilters || getActiveProductFiltersCount() > 0
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                            </svg>
                            Filters
                            {getActiveProductFiltersCount() > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {getActiveProductFiltersCount()}
                                </span>
                            )}
                        </button>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                                to="/addproduct"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products by name, category, description, or price..."
                            value={productSearchQuery}
                            onChange={(e) => setProductSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Filters Section */}
                {productShowFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={productCategoryFilter}
                                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories</option>
                                    {Array.from(new Set(product.map(p => p.category))).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                <select
                                    value={productPriceFilter}
                                    onChange={(e) => setProductPriceFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="low">Under ₹50</option>
                                    <option value="medium">₹50 - ₹100</option>
                                    <option value="high">Over ₹100</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={productSortBy}
                                    onChange={(e) => setProductSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="name">Name</option>
                                    <option value="price">Price</option>
                                    <option value="category">Category</option>
                                    <option value="date">Date Added</option>
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <select
                                    value={productSortOrder}
                                    onChange={(e) => setProductSortOrder(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {getActiveProductFiltersCount() > 0 && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearAllProductFilters}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Products Display */}
            {productViewMode === 'list' ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className="h-12 w-12 rounded-lg object-cover mr-4"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{item.title || '(No Title)'}</div>
                                                    <div className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{item.category || '(No Category)'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingPrice === item.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={editingPriceValue}
                                                        onChange={(e) => setEditingPriceValue(e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="Price"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editingActualPriceValue}
                                                        onChange={(e) => setEditingActualPriceValue(e.target.value)}
                                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="Original Price (MRP)"
                                                    />
                                                    <button
                                                        onClick={() => handlePriceSave(item)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={handlePriceCancel}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">₹{item.price !== undefined && item.price !== null ? item.price : '-'}</span>
                                                    {item.actualprice > item.price && (
                                                        <span className="text-xs text-gray-400 line-through">₹{item.actualprice}</span>
                                                    )}
                                                    <button
                                                        onClick={() => handlePriceEdit(item)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to="/updateproduct/$id"
                                                    params={{ id: item.id }}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => deleteProduct(item)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {item.category || '(No Category)'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title || '(No Title)'}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-gray-900">₹{item.price !== undefined && item.price !== null ? item.price : '-'}</span>
                                        {item.actualprice > item.price && (
                                            <span className="text-sm text-gray-400 line-through">₹{item.actualprice}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/updateproduct/$id"
                                            params={{ id: item.id }}
                                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => deleteProduct(item)}
                                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {getActiveProductFiltersCount() > 0 
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by adding your first product."
                        }
                    </p>
                    {getActiveProductFiltersCount() > 0 && (
                        <div className="mt-6">
                            <button
                                onClick={clearAllProductFilters}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Products; 