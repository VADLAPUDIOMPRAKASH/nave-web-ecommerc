import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Pencil, 
    Trash2, 
    Plus,
    Search,
    ArrowUpDown,
    MoreVertical,
    FileSpreadsheet,
    Image as ImageIcon,
    Save,
    X,
    FileText,
    Users,
    List,
    Grid3X3,
    Mail,
    Phone,
    MapPin,
    Eye,
    TrendingUp,
    ShoppingBag,
    Package,
    Leaf,
    CheckCircle
} from 'lucide-react';
import myContext from '../../../context/data/myContext';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { fireDB } from '../../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { collection, getDocs } from 'firebase/firestore';

// Add at the top of the file
const ChartBar = ({ data, labels, title }) => (
  <div className="w-full max-w-xl mx-auto my-6">
    <h3 className="text-sm font-bold mb-2 text-blue-700">{title}</h3>
    <div className="flex items-end h-32 gap-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className="bg-blue-400 rounded-t w-6" style={{ height: `${v}px` }}></div>
          <span className="text-xs mt-1 text-blue-700">{labels[i]}</span>
        </div>
      ))}
    </div>
  </div>
);

function DashboardTab({ activeTab, setActiveTab }) {
    const context = useContext(myContext);
    const { mode, product, edithandle, deleteProduct, order, user, setProduct, updateProduct } = context;
    const [editingPrice, setEditingPrice] = useState(null);
    const [editingPriceValue, setEditingPriceValue] = useState('');
    const [editingActualPriceValue, setEditingActualPriceValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [userViewMode, setUserViewMode] = useState('list'); // 'list' or 'card'
    // Add this line for block/unblock loading state
    const [blockLoading, setBlockLoading] = useState({});
    
    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [customerTypeFilter, setCustomerTypeFilter] = useState('all'); // 'all', 'new', 'regular', 'vip'
    const [orderFilter, setOrderFilter] = useState('all'); // 'all', 'no-orders', 'has-orders'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'orders', 'spent', 'visits'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
    const [showFilters, setShowFilters] = useState(false);
    
    // Products Search and Filter States
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');
    const [productPriceFilter, setProductPriceFilter] = useState('all'); // 'all', 'low', 'medium', 'high'
    const [productSortBy, setProductSortBy] = useState('name'); // 'name', 'price', 'category', 'date'
    const [productSortOrder, setProductSortOrder] = useState('asc');
    const [productShowFilters, setProductShowFilters] = useState(false);
    const [productViewMode, setProductViewMode] = useState('list'); // 'list' or 'card'

    const [deliveryCharges, setDeliveryCharges] = useState('');
    const [deliveryChargesLoading, setDeliveryChargesLoading] = useState(false);
    const deliveryChargesRef = useRef(null);

    const orderStatusOptions = [
      { value: 'placed', label: 'Placed', color: 'bg-blue-100 text-blue-700' },
      { value: 'harvested', label: 'Harvested', color: 'bg-lime-100 text-lime-700' },
      { value: 'out for delivery', label: 'Out for Delivery', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    ];

    const [orderStatusMap, setOrderStatusMap] = useState({});

    // Sync local status map with order data
    useEffect(() => {
      const map = {};
      order.forEach(o => {
        map[o.id] = (o.status || '').toLowerCase();
      });
      setOrderStatusMap(map);
    }, [order]);

    const handleOrderStatusChange = async (orderId, newStatus) => {
      try {
        const docRef = doc(fireDB, 'orders', orderId);
        await updateDoc(docRef, { status: newStatus });
        setOrderStatusMap(prev => ({ ...prev, [orderId]: newStatus }));
        toast.success('Order status updated!');
      } catch (err) {
        toast.error('Failed to update order status');
      }
    };

    // Fetch delivery charges on mount (for settings tab)
    useEffect(() => {
        const fetchDeliveryCharges = async () => {
            try {
                const docRef = doc(fireDB, 'settings', 'deliveryCharges');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    deliveryChargesRef.current = Number(docSnap.data().value) || 0;
                    setDeliveryCharges(docSnap.data().value?.toString() || '');
                }
            } catch (err) {
                deliveryChargesRef.current = 0;
            }
        };
        fetchDeliveryCharges();
    }, []);

    const handleSaveDeliveryCharges = async () => {
        setDeliveryChargesLoading(true);
        try {
            const docRef = doc(fireDB, 'settings', 'deliveryCharges');
            await setDoc(docRef, { value: Number(deliveryCharges) });
            toast.success('Delivery charges updated!');
        } catch (err) {
            toast.error('Failed to update delivery charges');
        } finally {
            setDeliveryChargesLoading(false);
        }
    };

    const handlePriceEdit = (item) => {
        setEditingPrice(item.id);
        setEditingPriceValue(item.price.toString());
        setEditingActualPriceValue(item.actualprice ? item.actualprice.toString() : '');
    };

    const handlePriceSave = async (item) => {
        // Find the full product object
        const fullProduct = product.find(p => p.id === item.id);
        if (!fullProduct) {
            toast.error('Product not found');
            return;
        }
        // Validation
        if (editingActualPriceValue && parseFloat(editingActualPriceValue) < parseFloat(editingPriceValue)) {
            toast.error('Original price (MRP) should be greater than or equal to selling price.');
            return;
        }
        // Create updated product object
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

    // Filter and Search Logic
    const getFilteredAndSortedUsers = () => {
        let filteredUsers = [...user];

        // Search functionality
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.phone?.toLowerCase().includes(query) ||
                user.address?.toLowerCase().includes(query) ||
                user.uid?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => {
                if (statusFilter === 'active') return user.isActive !== false;
                if (statusFilter === 'inactive') return user.isActive === false;
                return true;
            });
        }

        // Customer type filter
        if (customerTypeFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => {
                const orderCount = user.totalOrders || 0;
                if (customerTypeFilter === 'new') return orderCount === 0;
                if (customerTypeFilter === 'regular') return orderCount > 0 && orderCount <= 5;
                if (customerTypeFilter === 'vip') return orderCount > 5;
                return true;
            });
        }

        // Order filter
        if (orderFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => {
                const orderCount = user.totalOrders || 0;
                if (orderFilter === 'no-orders') return orderCount === 0;
                if (orderFilter === 'has-orders') return orderCount > 0;
                return true;
            });
        }

        // Sorting
        filteredUsers.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = (a.name || '').toLowerCase();
                    bValue = (b.name || '').toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.createdAt || a.date || 0);
                    bValue = new Date(b.createdAt || b.date || 0);
                    break;
                case 'orders':
                    aValue = a.totalOrders || 0;
                    bValue = b.totalOrders || 0;
                    break;
                case 'spent':
                    aValue = a.totalSpent || 0;
                    bValue = b.totalSpent || 0;
                    break;
                case 'visits':
                    aValue = a.pageVisits || 0;
                    bValue = b.pageVisits || 0;
                    break;
                default:
                    aValue = (a.name || '').toLowerCase();
                    bValue = (b.name || '').toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filteredUsers;
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCustomerTypeFilter('all');
        setOrderFilter('all');
        setSortBy('name');
        setSortOrder('asc');
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (statusFilter !== 'all') count++;
        if (customerTypeFilter !== 'all') count++;
        if (orderFilter !== 'all') count++;
        return count;
    };

    // Products Filter and Search Logic
    const getFilteredAndSortedProducts = () => {
        let filteredProducts = [...product];

        // Search functionality (only filter if search is not empty)
        if (productSearchQuery.trim()) {
            const query = productSearchQuery.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                (product.title || '').toLowerCase().includes(query) ||
                (product.category || '').toLowerCase().includes(query) ||
                (product.description || '').toLowerCase().includes(query) ||
                (product.price ? product.price.toString() : '').includes(query)
            );
        }

        // Category filter (only filter if not 'all')
        if (productCategoryFilter !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === productCategoryFilter
            );
        }

        // Price filter (only filter if not 'all')
        if (productPriceFilter !== 'all') {
            filteredProducts = filteredProducts.filter(product => {
                const price = parseFloat(product.price) || 0;
                if (productPriceFilter === 'low') return price < 50;
                if (productPriceFilter === 'medium') return price >= 50 && price < 100;
                if (productPriceFilter === 'high') return price >= 100;
                return true;
            });
        }

        // Sorting
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

    const renderOverview = () => (
        <div className="p-6 bg-white rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Overview
            </h2>
            <div className="space-y-4">
                <div className="p-4 rounded-xl shadow bg-gradient-to-r from-blue-50 to-blue-100">
                    <h3 className="text-lg font-medium mb-2 text-gray-800">
                        Recent Activity
                    </h3>
                    <div className="text-gray-500 text-sm italic">No recent activity yet.</div>
                </div>
                <div className="p-4 rounded-xl shadow bg-gradient-to-r from-cyan-50 to-cyan-100">
                    <h3 className="text-lg font-medium mb-2 text-gray-800">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link to="/addproduct" className="flex items-center p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow font-semibold">
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Product
                        </Link>
                        <button className="flex items-center p-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 shadow font-semibold">
                            <FileSpreadsheet className="w-5 h-5 mr-2" />
                            Export Report
                        </button>
                        <button
                            className="flex items-center p-3 rounded-lg bg-cyan-400 text-white hover:bg-cyan-500 shadow font-semibold"
                            onClick={() => setActiveTab && setActiveTab('banners')}
                        >
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Update Banners
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProducts = () => {
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setProductViewMode('card')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                        productViewMode === 'card'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
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
                                    to="/admin/addproduct"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                    Add Product
                </Link>
                                
                            </div>
                        </div>
            </div>

                    {/* Search Bar */}
                    <div className="mt-4">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
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
                                                        to={`/updateproduct/${item.id}`}
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
                                                to={`/updateproduct/${item.id}`}
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

    // Replace renderOrders with a modern list view and status stepper buttons
    const renderOrders = () => {
      // Group orders by date (YYYY-MM-DD)
      const grouped = {};
      order.forEach(item => {
        const date = new Date(item.date || item.timestamp).toLocaleDateString('en-CA');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      });
      // Sort dates descending
      const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
      return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Orders</h2>
          {sortedDates.length === 0 && <div className="text-gray-500 text-lg">No orders found.</div>}
          <div className="space-y-12">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xl font-bold text-blue-700 bg-blue-100 px-4 py-1 rounded-full shadow-sm">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' })}</span>
                  <span className="text-gray-500 text-sm">{grouped[date].length} order{grouped[date].length > 1 ? 's' : ''}</span>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-x-auto">
                  <table className="min-w-full divide-y divide-blue-100">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Products</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Placed</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                      {grouped[date].map((item, idx) => {
                        const statusObj = orderStatusOptions.find(opt => (opt.value === (orderStatusMap[item.id] || (item.status || '').toLowerCase())));
                        const statusSteps = [
                          { value: 'placed', label: 'Placed' },
                          { value: 'harvested', label: 'Harvested' },
                          { value: 'out for delivery', label: 'Out for Delivery' },
                          { value: 'delivered', label: 'Delivered' },
                        ];
                        const currentStep = statusSteps.findIndex(s => s.value === (orderStatusMap[item.id] || (item.status || '').toLowerCase()));
                        return (
                          <tr key={item.id} className="hover:bg-blue-50 transition">
                            <td className="px-4 py-4 font-semibold text-gray-900">{item.orderId ? `#${item.orderId}` : item.id ? `#${item.id.slice(-8)}` : 'N/A'}</td>
                            <td className="px-4 py-4 text-gray-900">{item.addressInfo?.name}</td>
                            <td className="px-4 py-4 text-gray-900">{item.cartItems?.length} item{item.cartItems?.length > 1 ? 's' : ''}</td>
                            <td className="px-4 py-4 font-bold text-green-700">
                              {(() => {
                                let subtotal = typeof item.subtotal === 'number' ? item.subtotal : (item.cartItems ? item.cartItems.reduce((t, i) => t + (i.price * (i.quantity || 1)), 0) : 0);
                                let delivery = typeof item.deliveryCharges === 'number' ? item.deliveryCharges : (typeof item.grandTotal === 'number' && typeof item.subtotal === 'number' ? (item.grandTotal - item.subtotal) : (deliveryChargesRef.current ?? 0));
                                let total = typeof item.grandTotal === 'number' ? item.grandTotal : (subtotal + delivery);
                                return `₹${total.toFixed(2)}`;
                              })()}
                                </td>
                            <td className="px-4 py-4 text-gray-700">{item.date || '-'}</td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2 items-center">
                                {statusSteps.map((step, i) => (
                                  <button
                                    key={step.value}
                                    onClick={() => handleOrderStatusChange(item.id, step.value)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold transition-all duration-200
                                      ${i < currentStep ? 'bg-green-100 text-green-700 border-green-300' :
                                        i === currentStep ? 'bg-green-600 text-white border-green-600' :
                                        'bg-gray-100 text-gray-400 border-gray-200'}
                                      ${i === currentStep ? 'shadow-lg' : ''}
                                    `}
                                    title={step.label}
                                  >
                                    {i <= currentStep ? <CheckCircle className="w-4 h-4" /> : <span className="w-4 h-4 inline-block" />}
                                    {step.label}
                                  </button>
                                ))}
                                {item.status !== 'delivered' && item.status !== 'cancelled' && (
                                  <button
                                    className="ml-2 px-3 py-1 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                                    onClick={() => { setCancelOrderId(item.id); setCancelReason(''); }}
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  let subtotal = typeof item.subtotal === 'number' ? item.subtotal : (item.cartItems ? item.cartItems.reduce((t, i) => t + (i.price * (i.quantity || 1)), 0) : 0);
                                  let delivery = typeof item.deliveryCharges === 'number' ? item.deliveryCharges : (typeof item.grandTotal === 'number' && typeof item.subtotal === 'number' ? (item.grandTotal - item.subtotal) : (deliveryChargesRef.current ?? 0));
                                  let total = typeof item.grandTotal === 'number' ? item.grandTotal : (subtotal + delivery);
                                  return `Subtotal: ₹${subtotal.toFixed(2)} + Delivery: ₹${delivery.toFixed(2)}\nTotal: ₹${total.toFixed(2)}`;
                                })()}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                </table>
                </div>
              </div>
            ))}
            </div>
        </div>
    );
    };

    const renderUsers = () => (
        <div className="p-6 bg-white rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
                    <p className="text-gray-600 mt-1">Manage and track user information</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Total: {user.length}</span>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
                {/* Main Search and Controls */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users by name, email, phone, address..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-300"
                        />
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${
                            showFilters 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <ArrowUpDown className="w-5 h-5" />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </button>
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setUserViewMode('list')}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                                userViewMode === 'list' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                            title="List View"
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setUserViewMode('card')}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                                userViewMode === 'card' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                            title="Card View"
                        >
                            <Grid3X3 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition-all duration-300"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Customer Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                                <select
                                    value={customerTypeFilter}
                                    onChange={(e) => setCustomerTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition-all duration-300"
                                >
                                    <option value="all">All Types</option>
                                    <option value="new">New Customers</option>
                                    <option value="regular">Regular Customers</option>
                                    <option value="vip">VIP Customers</option>
                                </select>
                            </div>

                            {/* Order Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Orders</label>
                                <select
                                    value={orderFilter}
                                    onChange={(e) => setOrderFilter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition-all duration-300"
                                >
                                    <option value="all">All Orders</option>
                                    <option value="no-orders">No Orders</option>
                                    <option value="has-orders">Has Orders</option>
                                </select>
                            </div>

                            {/* Sort Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition-all duration-300"
                                >
                                    <option value="name">Name</option>
                                    <option value="date">Join Date</option>
                                    <option value="orders">Total Orders</option>
                                    <option value="spent">Total Spent</option>
                                    <option value="visits">Page Visits</option>
                                </select>
                            </div>
                        </div>

                        {/* Sort Order and Clear Filters */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="sortOrder"
                                        value="asc"
                                        checked={sortOrder === 'asc'}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    Ascending
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="sortOrder"
                                        value="desc"
                                        checked={sortOrder === 'desc'}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    Descending
                                </label>
                            </div>
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                        <span>Showing {getFilteredAndSortedUsers().length} of {user.length} users</span>
                        {getActiveFiltersCount() > 0 && (
                            <span className="text-blue-600 font-medium">
                                {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
                            </span>
                        )}
                    </div>
                    {searchQuery.trim() && (
                        <span className="text-gray-500">
                            Search results for: "{searchQuery}"
                        </span>
                    )}
                </div>
            </div>

            {/* List View */}
            {userViewMode === 'list' && (
                <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
                    <table className="w-full text-sm">
                    <thead>
                            <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200"> 
                                <th className="p-4 font-semibold text-gray-700 text-left">User Info</th>
                                <th className="p-4 font-semibold text-gray-700 text-left">Contact</th>
                                <th className="p-4 font-semibold text-gray-700 text-left">Activity</th>
                                <th className="p-4 font-semibold text-gray-700 text-left">Orders</th>
                                <th className="p-4 font-semibold text-gray-700 text-left">Status</th>
                                <th className="p-4 font-semibold text-gray-700 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                            {getFilteredAndSortedUsers().map((item, index) => (
                                <tr key={index} className={`border-b border-gray-100 hover:bg-indigo-50 transition-all duration-300 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}>
                                    {/* User Info */}
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                                                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{item.name || 'Anonymous User'}</div>
                                                <div className="text-xs text-gray-500">ID: {item.uid?.substring(0, 8)}...</div>
                                                <div className="text-xs text-gray-500">Joined: {item.date || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Contact Info */}
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-gray-900">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mr-2">Email</span>
                                                {item.email || 'Not provided'}
                                            </div>
                                            <div className="flex items-center text-gray-900">
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mr-2">Phone</span>
                                                {item.phone || 'Not provided'}
                                            </div>
                                            <div className="flex items-center text-gray-900">
                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full mr-2">Address</span>
                                                <span className="text-xs">
                                                    {item.address ? 
                                                        (item.address.length > 30 ? item.address.substring(0, 30) + '...' : item.address) 
                                                        : 'Not provided'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Activity */}
                                    <td className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Page Visits:</span>
                                                <span className="font-semibold text-indigo-600">
                                                    {item.pageVisits || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Last Visit:</span>
                                                <span className="text-xs text-gray-500">
                                                    {item.lastVisit || 'Never'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full" 
                                                    style={{ width: `${Math.min((item.pageVisits || 0) * 10, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Orders */}
                                    <td className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Total Orders:</span>
                                                <span className="font-semibold text-green-600">
                                                    {item.totalOrders || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Total Spent:</span>
                                                <span className="font-semibold text-green-600">
                                                    ₹{item.totalSpent || 0}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full" 
                                                    style={{ width: `${Math.min((item.totalOrders || 0) * 20, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Status */}
                                    <td className="p-4">
                                        <div className="flex flex-col items-start space-y-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                item.isActive !== false 
                                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                                    : 'bg-red-100 text-red-800 border border-red-300'
                                            }`}>
                                                {item.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                (item.totalOrders || 0) > 5 
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                                                    : (item.totalOrders || 0) > 0 
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                                            }`}>
                                                {(item.totalOrders || 0) > 5 ? 'VIP Customer' : 
                                                 (item.totalOrders || 0) > 0 ? 'Regular Customer' : 'New Customer'}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    {/* Actions */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all duration-300" title="View Details">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-all duration-300" title="Send Message">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-all duration-300" title="Edit User">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                              className={`p-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                                                item.isActive === false
                                                  ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                                  : 'bg-red-100 hover:bg-red-200 text-red-700'
                                              }`}
                                              disabled={blockLoading && blockLoading[item.uid]}
                                              onClick={async () => {
                                                setBlockLoading(prev => ({ ...prev, [item.uid]: true }));
                                                try {
                                                  await updateDoc(doc(fireDB, 'users', item.uid), { isActive: item.isActive === false });
                                                  toast.success(`User ${item.isActive === false ? 'unblocked' : 'blocked'} successfully!`);
                                                  // Optionally, trigger a refresh of the user list if needed
                                                } catch (err) {
                                                  toast.error('Failed to update user status');
                                                } finally {
                                                  setBlockLoading(prev => ({ ...prev, [item.uid]: false }));
                                                }
                                              }}
                                            >
                                              {item.isActive === false ? 'Unblock' : 'Block'}
                                            </button>
                                        </div>
                                    </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

            {/* Card View */}
            {userViewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getFilteredAndSortedUsers().map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                                        {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs opacity-80">Customer Type</div>
                                        <div className="text-sm font-semibold">
                                            {(item.totalOrders || 0) > 5 ? 'VIP' : 
                                             (item.totalOrders || 0) > 0 ? 'Regular' : 'New'}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{item.name || 'Anonymous User'}</h3>
                                    <p className="text-sm opacity-80">{item.email || 'No email'}</p>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 space-y-4">
                                {/* Contact Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-700">
                                        <Mail className="w-4 h-4 mr-3 text-blue-500" />
                                        <span className="text-sm truncate">{item.email || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <Phone className="w-4 h-4 mr-3 text-green-500" />
                                        <span className="text-sm">{item.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-start text-gray-700">
                                        <MapPin className="w-4 h-4 mr-3 text-orange-500 mt-0.5" />
                                        <span className="text-sm line-clamp-2">
                                            {item.address || 'Not provided'}
                                        </span>
                                    </div>
                                </div>

                                {/* Activity Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-1">
                                            <Eye className="w-4 h-4 text-indigo-500 mr-1" />
                                            <span className="text-xs text-gray-600">Visits</span>
                                        </div>
                                        <div className="text-lg font-bold text-indigo-600">{item.pageVisits || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-1">
                                            <ShoppingBag className="w-4 h-4 text-green-500 mr-1" />
                                            <span className="text-xs text-gray-600">Orders</span>
                                        </div>
                                        <div className="text-lg font-bold text-green-600">{item.totalOrders || 0}</div>
                                    </div>
                                </div>

                                {/* Progress Bars */}
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Activity</span>
                                            <span>{Math.min((item.pageVisits || 0) * 10, 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                                                style={{ width: `${Math.min((item.pageVisits || 0) * 10, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Orders</span>
                                            <span>{Math.min((item.totalOrders || 0) * 20, 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${Math.min((item.totalOrders || 0) * 20, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status and Actions */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            item.isActive !== false 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-sm font-semibold text-green-600">
                                            ₹{item.totalSpent || 0}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all duration-300 text-xs font-medium" title="View Details">
                                            <Eye className="w-4 h-4 mx-auto" />
                                        </button>
                                        <button className="flex-1 p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-all duration-300 text-xs font-medium" title="Send Message">
                                            <Mail className="w-4 h-4 mx-auto" />
                                        </button>
                                        <button className="flex-1 p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-all duration-300 text-xs font-medium" title="Edit User">
                                            <Pencil className="w-4 h-4 mx-auto" />
                                        </button>
                                        <button
                                          className={`p-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                                            item.isActive === false
                                              ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                                          }`}
                                          disabled={blockLoading && blockLoading[item.uid]}
                                          onClick={async () => {
                                            setBlockLoading(prev => ({ ...prev, [item.uid]: true }));
                                            try {
                                              await updateDoc(doc(fireDB, 'users', item.uid), { isActive: item.isActive === false });
                                              toast.success(`User ${item.isActive === false ? 'unblocked' : 'blocked'} successfully!`);
                                              // Optionally, trigger a refresh of the user list if needed
                                            } catch (err) {
                                              toast.error('Failed to update user status');
                                            } finally {
                                              setBlockLoading(prev => ({ ...prev, [item.uid]: false }));
                                            }
                                          }}
                                        >
                                          {item.isActive === false ? 'Unblock' : 'Block'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Empty State */}
            {getFilteredAndSortedUsers().length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    {user.length === 0 ? (
                        <>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">Users will appear here once they register on your platform.</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-500 mb-4">
                                No users match your current search and filter criteria.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                            >
                                Clear All Filters
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );

    const renderAnalytics = () => {
        // Aggregate all cart items from all orders
        const allCartItems = order.flatMap(o => o.cartItems || []);

        // --- New: Summary Cards ---
        const totalRevenue = order.reduce((sum, o) => sum + (typeof o.grandTotal === 'number' ? o.grandTotal : 0), 0);
        const totalOrders = order.length;
        const totalCustomers = new Set(order.map(o => o.addressInfo?.phoneNumber || o.addressInfo?.name)).size;
        const avgOrderValue = totalOrders ? (totalRevenue / totalOrders) : 0;

        // --- New: Orders Over Time (Line Chart Data) ---
        const ordersByDate = {};
        order.forEach(o => {
            const d = o.date || o.timestamp || '';
            if (d) {
                const dateKey = d.slice(0, 10); // YYYY-MM-DD
                ordersByDate[dateKey] = (ordersByDate[dateKey] || 0) + 1;
            }
        });
        const lineLabels = Object.keys(ordersByDate).sort();
        const lineData = lineLabels.map(l => ordersByDate[l]);

        // --- New: Order Status Pie Chart ---
        const statusCounts = order.reduce((acc, o) => {
            const s = (o.status || 'unknown').toLowerCase();
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, {});
        const statusLabels = Object.keys(statusCounts);
        const statusData = Object.values(statusCounts);
        const statusColors = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#6ee7b7'];

        // --- New: Top 5 Products by Sales ---
        const productSales = {};
        allCartItems.forEach(item => {
            if (!item.title) return;
            productSales[item.title] = (productSales[item.title] || 0) + (item.quantity ? Number(item.quantity) : 1);
        });
        const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // --- New: Top 5 Customers by Spend ---
        const customerSpend = {};
        order.forEach(o => {
            const key = o.addressInfo?.phoneNumber || o.addressInfo?.name || 'Unknown';
            customerSpend[key] = (customerSpend[key] || 0) + (typeof o.grandTotal === 'number' ? o.grandTotal : 0);
        });
        const topCustomers = Object.entries(customerSpend).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // --- Existing: Category Bar Chart and Pie Chart ---
        const categoryCounts = allCartItems.reduce((acc, item) => {
            const cat = item.category || 'Other';
            acc[cat] = (acc[cat] || 0) + (item.quantity ? Number(item.quantity) : 1);
            return acc;
        }, {});
        const chartLabels = Object.keys(categoryCounts);
        const chartData = Object.values(categoryCounts);
        const vegTotal = categoryCounts['Vegetables'] || 0;
        const leafyTotal = categoryCounts['Leafy Vegetables'] || 0;
        const pieTotal = vegTotal + leafyTotal;
        const vegPercent = pieTotal ? Math.round((vegTotal / pieTotal) * 100) : 0;
        const leafyPercent = pieTotal ? Math.round((leafyTotal / pieTotal) * 100) : 0;

        // --- UI ---
        return (
            <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl shadow-xl min-h-[60vh] flex flex-col gap-10 w-full">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-blue-700 mb-1">₹{totalRevenue.toLocaleString()}</span>
                        <span className="text-gray-700 font-semibold">Total Revenue</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-green-700 mb-1">{totalOrders}</span>
                        <span className="text-gray-700 font-semibold">Total Orders</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-indigo-700 mb-1">{totalCustomers}</span>
                        <span className="text-gray-700 font-semibold">Total Customers</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-pink-700 mb-1">₹{avgOrderValue.toFixed(2)}</span>
                        <span className="text-gray-700 font-semibold">Avg. Order Value</span>
                    </div>
                </div>

                {/* Orders by Category (Bar Chart) */}
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                    <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" /> Orders by Category
                    </h3>
                    <div className="flex gap-8 items-end h-48">
                        {chartLabels.map((cat, idx) => (
                            <div key={cat} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-14 rounded-t-2xl bg-gradient-to-t from-blue-500 to-blue-300 shadow-lg flex items-end justify-center"
                                    style={{ height: `${(chartData[idx] / Math.max(...chartData, 1)) * 140 + 24}px` }}
                                >
                                    <span className="text-white font-bold text-lg drop-shadow-sm">{Math.round(chartData[idx])}</span>
                                </div>
                                <span className="mt-3 text-base text-blue-900 text-center font-medium break-words">{cat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vegetables vs Leafy Vegetables Share (Donut Chart) */}
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center mb-8">
                    <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-green-500" /> Vegetables vs Leafy Vegetables Share
                    </h3>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                            <circle cx="18" cy="18" r="16" fill="#e5f6fd" />
                            <circle
                                cx="18" cy="18" r="16"
                                fill="transparent"
                                stroke="#34d399"
                                strokeWidth="8"
                                strokeDasharray={`${vegPercent} ${100 - vegPercent}`}
                                strokeDashoffset="25"
                                style={{ transition: 'stroke-dasharray 0.5s' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-extrabold text-green-600">{vegPercent}%</span>
                            <span className="text-gray-700 text-base font-medium">Vegetables</span>
                        </div>
                        <div className="absolute bottom-3 right-3 text-sm text-lime-700 font-semibold bg-lime-100 px-2 py-1 rounded shadow">Leafy: {leafyPercent}%</div>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-green-400"></span> Vegetables
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-lime-400"></span> Leafy Vegetables
                        </span>
                            </div>
                            </div>

                {/* Order Status Pie Chart */}
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center mb-8">
                    <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" /> Order Status Distribution
                    </h3>
                    <svg width="180" height="180" viewBox="0 0 36 36">
                        {(() => {
                            let total = statusData.reduce((a, b) => a + b, 0);
                            let acc = 0;
                            return statusData.map((v, i) => {
                                const start = (acc / total) * 100;
                                acc += v;
                                const end = (acc / total) * 100;
                                const large = end - start > 50 ? 1 : 0;
                                const r = 16, cx = 18, cy = 18;
                                const startAngle = (start / 100) * 2 * Math.PI;
                                const endAngle = (end / 100) * 2 * Math.PI;
                                const x1 = cx + r * Math.sin(startAngle);
                                const y1 = cy - r * Math.cos(startAngle);
                                const x2 = cx + r * Math.sin(endAngle);
                                const y2 = cy - r * Math.cos(endAngle);
                                return (
                                    <path
                                        key={i}
                                        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                                        fill={statusColors[i % statusColors.length]}
                                        stroke="#fff"
                                        strokeWidth="0.5"
                                    />
                                );
                            });
                        })()}
                    </svg>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {statusLabels.map((label, i) => (
                            <span key={label} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold" style={{ background: statusColors[i % statusColors.length], color: '#fff' }}>
                                {label}: {statusData[i]}
                            </span>
                        ))}
                    </div>
                            </div>

                {/* Top 5 Products by Sales */}
                <section className="w-full max-w-2xl mx-auto mb-8">
                    <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-500" /> Top 5 Products by Sales
                    </h3>
                    <div className="bg-white rounded-xl shadow p-6 divide-y divide-gray-100">
                        {topProducts.length === 0 && <span className="text-gray-500">No product sales data</span>}
                        {topProducts.map(([name, count], idx) => (
                            <div key={name} className="flex justify-between py-3 items-center">
                                <span className="font-medium text-gray-800 text-lg">{name}</span>
                                <span className="font-bold text-indigo-700">{count} sold</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top 5 Customers by Spend (with name, phone, avatar) */}
                <section className="w-full max-w-2xl mx-auto mb-8">
                    <h3 className="text-xl font-bold text-pink-700 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-500" /> Top 5 Customers by Spend
                    </h3>
                    <div className="bg-white rounded-xl shadow p-6 divide-y divide-gray-100">
                        {topCustomers.length === 0 && <span className="text-gray-500">No customer data</span>}
                        {topCustomers.map(([key, amount], idx) => {
                            // Find a matching order to get name/phone
                            const orderMatch = order.find(o =>
                                (o.addressInfo?.phoneNumber || o.addressInfo?.name) === key
                            );
                            const name = orderMatch?.addressInfo?.name || 'Unknown';
                            const phone = orderMatch?.addressInfo?.phoneNumber || '';
                            return (
                                <div key={key} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700 text-lg">
                                            {name.charAt(0).toUpperCase()}
                            </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">{name}</div>
                                            {phone && <div className="text-xs text-gray-500">{phone}</div>}
                    </div>
                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-pink-700 text-lg">₹{amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
        </div>
    );
    };

    const renderSettings = () => (
        <div className="p-6 bg-white rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Settings</h2>
            {/* Delivery Charges Section */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-2 text-green-700">Delivery Charges</h3>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        min="0"
                        className="border rounded-lg px-4 py-2 w-40 text-lg"
                        placeholder="Enter charges (₹)"
                        value={deliveryCharges}
                        onChange={e => setDeliveryCharges(e.target.value)}
                        disabled={deliveryChargesLoading}
                    />
                    <button
                        onClick={handleSaveDeliveryCharges}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                        disabled={deliveryChargesLoading}
                    >
                        {deliveryChargesLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
                <div className="text-gray-500 text-sm mt-2">This charge will be applied to all orders at checkout.</div>
            </div>
            {/* Add settings content here */}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'products':
                return renderProducts();
            case 'orders':
                return renderOrders();
            case 'users':
                return renderUsers();
            case 'analytics':
                return renderAnalytics();
            case 'settings':
                return renderSettings();
            default:
                return renderOverview();
        }
    };

    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    // Cancel Order Popup
    {cancelOrderId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative">
          <button onClick={() => setCancelOrderId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
          <h3 className="text-lg font-bold mb-4 text-red-700">Cancel Order</h3>
          <label className="block text-sm font-semibold mb-2">Reason for cancellation:</label>
          <textarea
            className="w-full border rounded-lg p-2 mb-4 text-sm"
            rows={3}
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Enter reason..."
          />
          <button
            className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
            disabled={cancelLoading || !cancelReason.trim()}
            onClick={async () => {
              setCancelLoading(true);
              try {
                await updateDoc(doc(fireDB, 'orders', cancelOrderId), {
                  status: 'cancelled',
                  cancellationReason: cancelReason,
                  cancellationTime: new Date().toISOString(),
                });
                toast.success('Order cancelled successfully!');
                setCancelOrderId(null);
                setCancelReason('');
              } catch (err) {
                toast.error('Failed to cancel order');
              } finally {
                setCancelLoading(false);
              }
            }}
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    )}

    return (
      <>
        {cancelOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative">
              <button onClick={() => setCancelOrderId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
              <h3 className="text-lg font-bold mb-4 text-red-700">Cancel Order</h3>
              <label className="block text-sm font-semibold mb-2">Reason for cancellation:</label>
              <textarea
                className="w-full border rounded-lg p-2 mb-4 text-sm"
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Enter reason..."
              />
              <button
                className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
                disabled={cancelLoading || !cancelReason.trim()}
                onClick={async () => {
                  setCancelLoading(true);
                  try {
                    await updateDoc(doc(fireDB, 'orders', cancelOrderId), {
                      status: 'cancelled',
                      cancellationReason: cancelReason,
                      cancellationTime: new Date().toISOString(),
                    });
                    toast.success('Order cancelled successfully!');
                    setCancelOrderId(null);
                    setCancelReason('');
                  } catch (err) {
                    toast.error('Failed to cancel order');
                  } finally {
                    setCancelLoading(false);
                  }
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        )}
        {renderContent()}
      </>
    );
}

export default DashboardTab;