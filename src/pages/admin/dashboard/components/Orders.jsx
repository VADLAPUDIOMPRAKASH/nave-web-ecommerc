import React, { useContext, useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Leaf, Package, BarChart3, Filter } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../../../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import myContext from '../../../../context/data/myContext';

const Orders = () => {
    const context = useContext(myContext);
    const { order } = context;
    const [orderStatusMap, setOrderStatusMap] = useState({});
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // ['all', 'vegetables', 'leafy', 'analytics']
    const [dateFilter, setDateFilter] = useState('all'); // ['all', 'today', 'week', 'month']

    // Debug logs
    useEffect(() => {
        console.log('Raw orders from context:', order);
    }, [order]);

    const orderStatusOptions = [
        { value: 'placed', label: 'Placed', color: 'bg-blue-100 text-blue-700' },
        { value: 'harvested', label: 'Harvested', color: 'bg-lime-100 text-lime-700' },
        { value: 'out for delivery', label: 'Out for Delivery', color: 'bg-yellow-100 text-yellow-700' },
        { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    ];

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

    // Filter orders by date range
    const filterOrdersByDate = (orders) => {
        console.log('Filtering orders by date:', { dateFilter, ordersCount: orders.length });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const filtered = orders.filter(item => {
            // Try to parse the date from either timestamp or date field
            let orderDate;
            if (item.timestamp) {
                // Handle both ISO string and Firestore timestamp
                orderDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
            } else if (item.date) {
                // Parse date string in format "MMM DD, YYYY"
                orderDate = new Date(item.date);
            } else {
                console.log('No valid date found for order:', item);
                return false;
            }

            console.log('Order date:', { raw: item.date, timestamp: item.timestamp, parsed: orderDate });
            
            switch(dateFilter) {
                case 'today':
                    return orderDate >= today;
                case 'week':
                    return orderDate >= weekAgo;
                case 'month':
                    return orderDate >= monthAgo;
                default:
                    return true;
            }
        });
        console.log('Orders after date filtering:', filtered.length);
        return filtered;
    };

    // Calculate order statistics
    const calculateStats = (filteredOrders) => {
        const stats = {
            vegetables: { count: 0, revenue: 0, items: 0 },
            leafy: { count: 0, revenue: 0, items: 0 },
            topVegetables: {},
            topLeafy: {},
            dailyTrends: {},
            categoryWiseRevenue: {}
        };

        filteredOrders.forEach(order => {
            const orderDate = new Date(order.date || order.timestamp).toLocaleDateString();
            if (!stats.dailyTrends[orderDate]) {
                stats.dailyTrends[orderDate] = { vegetables: 0, leafy: 0 };
            }

            order.cartItems?.forEach(item => {
                const isLeafy = item.category?.toLowerCase().includes('leafy');
                const category = isLeafy ? 'leafy' : 'vegetables';
                const itemTotal = (item.price || 0) * (item.quantity || 1);

                // Update category stats
                stats[category].count++;
                stats[category].revenue += itemTotal;
                stats[category].items += (item.quantity || 1);

                // Update top items
                const targetTop = isLeafy ? stats.topLeafy : stats.topVegetables;
                if (!targetTop[item.title]) {
                    targetTop[item.title] = { quantity: 0, revenue: 0 };
                }
                targetTop[item.title].quantity += (item.quantity || 1);
                targetTop[item.title].revenue += itemTotal;

                // Update daily trends
                stats.dailyTrends[orderDate][category]++;

                // Update category-wise revenue
                if (!stats.categoryWiseRevenue[item.category]) {
                    stats.categoryWiseRevenue[item.category] = 0;
                }
                stats.categoryWiseRevenue[item.category] += itemTotal;
            });
        });

        return stats;
    };

    // Group orders by date and user
    const filteredOrders = filterOrdersByDate(order);
    console.log('Orders after date filtering:', filteredOrders);
    
    const grouped = {};
    filteredOrders.forEach(item => {
        let orderDate;
        if (item.timestamp) {
            orderDate = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
        } else if (item.date) {
            orderDate = new Date(item.date);
        } else {
            console.log('No valid date found for order:', item);
            return;
        }

        // Format date as YYYY-MM-DD
        const date = orderDate.toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = {};
        
        // Group by user
        const userId = item.addressInfo?.name || 'Unknown User';
        if (!grouped[date][userId]) {
            grouped[date][userId] = {
                orders: [],
                totalAmount: 0,
                totalItems: 0
            };
        }
        grouped[date][userId].orders.push(item);
        grouped[date][userId].totalAmount += parseFloat(item.grandTotal || 0);
        grouped[date][userId].totalItems += (item.cartItems?.length || 0);
    });
    
    console.log('Final grouped orders:', grouped);
    
    // Sort dates descending
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    console.log('Sorted dates:', sortedDates);

    // Calculate statistics
    const stats = calculateStats(filteredOrders);

    const renderAnalytics = () => (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Vegetables</h3>
                        <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Orders</span>
                            <span className="font-bold text-gray-900">{stats.vegetables.count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Items Sold</span>
                            <span className="font-bold text-gray-900">{stats.vegetables.items}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Revenue</span>
                            <span className="font-bold text-green-600">₹{stats.vegetables.revenue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Leafy Vegetables</h3>
                        <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Orders</span>
                            <span className="font-bold text-gray-900">{stats.leafy.count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Items Sold</span>
                            <span className="font-bold text-gray-900">{stats.leafy.items}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Revenue</span>
                            <span className="font-bold text-green-600">₹{stats.leafy.revenue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Top Vegetables</h3>
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                        {Object.entries(stats.topVegetables)
                            .sort((a, b) => b[1].quantity - a[1].quantity)
                            .slice(0, 3)
                            .map(([name, data], idx) => (
                                <div key={name} className="flex justify-between items-center">
                                    <span className="text-gray-600 truncate">{name}</span>
                                    <span className="font-bold text-gray-900">{data.quantity}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Top Leafy</h3>
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                        {Object.entries(stats.topLeafy)
                            .sort((a, b) => b[1].quantity - a[1].quantity)
                            .slice(0, 3)
                            .map(([name, data], idx) => (
                                <div key={name} className="flex justify-between items-center">
                                    <span className="text-gray-600 truncate">{name}</span>
                                    <span className="font-bold text-gray-900">{data.quantity}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Category-wise Revenue Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category-wise Revenue</h3>
                <div className="space-y-4">
                    {Object.entries(stats.categoryWiseRevenue).map(([category, revenue]) => (
                        <div key={category} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">{category}</span>
                                <span className="font-bold text-green-600">₹{revenue.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{
                                        width: `${(revenue / Object.values(stats.categoryWiseRevenue).reduce((a, b) => a + b, 0)) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Trends Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Order Trends</h3>
                <div className="space-y-6">
                    {Object.entries(stats.dailyTrends)
                        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                        .slice(0, 7)
                        .map(([date, data]) => (
                            <div key={date} className="space-y-2">
                                <div className="text-sm text-gray-600">{new Date(date).toLocaleDateString('en-IN', { 
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}</div>
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Vegetables</span>
                                            <span>{data.vegetables} orders</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${(data.vegetables / (data.vegetables + data.leafy || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Leafy Vegetables</span>
                                            <span>{data.leafy} orders</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-lime-600 h-2 rounded-full"
                                                style={{ width: `${(data.leafy / (data.vegetables + data.leafy || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
            {/* Header with Tabs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h2>
                
                <div className="flex flex-wrap gap-4">
                    {/* Date Filter */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    {/* Tab Buttons */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-300 bg-white">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('vegetables')}
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === 'vegetables'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Vegetables
                        </button>
                        <button
                            onClick={() => setActiveTab('leafy')}
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === 'leafy'
                                    ? 'bg-lime-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Leafy Vegetables
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 text-sm font-medium ${
                                activeTab === 'analytics'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'analytics' ? (
                renderAnalytics()
            ) : (
                <>
                    {sortedDates.length === 0 && <div className="text-gray-500 text-lg">No orders found.</div>}
                    <div className="space-y-12">
                        {sortedDates.map(date => (
                            <div key={date} className="space-y-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="text-xl font-bold text-blue-700 bg-blue-100 px-4 py-1 rounded-full shadow-sm">
                                        {new Date(date).toLocaleDateString('en-IN', { 
                                            day: '2-digit', 
                                            month: 'short', 
                                            year: 'numeric', 
                                            weekday: 'short' 
                                        })}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        {Object.keys(grouped[date]).length} customer{Object.keys(grouped[date]).length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {Object.entries(grouped[date]).map(([userId, userData]) => (
                                        <div key={`${date}-${userId}`} className="mb-6">
                                            <div className="flex items-center gap-2 mb-3 bg-blue-50 p-3 rounded-lg">
                                                <h3 className="text-lg font-semibold text-blue-800">{userId}</h3>
                                                <span className="text-sm text-blue-600">
                                                    {userData.orders.length} order{userData.orders.length > 1 ? 's' : ''} |
                                                    Total: ₹{userData.totalAmount.toFixed(2)} |
                                                    {userData.totalItems} items
                                                </span>
                                            </div>
                                            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-x-auto">
                                                <table className="min-w-full divide-y divide-blue-100">
                                                    <thead className="bg-blue-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order Time</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Products</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Total</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-blue-50">
                                                        {userData.orders
                                                            .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))
                                                            .filter(item => {
                                                                if (activeTab === 'all') return true;
                                                                return item.cartItems?.some(cartItem => {
                                                                    const isLeafy = cartItem.category?.toLowerCase().includes('leafy');
                                                                    return activeTab === 'leafy' ? isLeafy : !isLeafy;
                                                                });
                                                            })
                                                            .map((item) => {
                                                                const orderTime = new Date(item.date || item.timestamp);
                                                                const statusSteps = [
                                                                    { value: 'placed', label: 'Placed' },
                                                                    { value: 'harvested', label: 'Harvested' },
                                                                    { value: 'out for delivery', label: 'Out for Delivery' },
                                                                    { value: 'delivered', label: 'Delivered' },
                                                                ];
                                                                const currentStep = statusSteps.findIndex(s => 
                                                                    s.value === (orderStatusMap[item.id] || (item.status || '').toLowerCase())
                                                                );
                                                                return (
                                                                    <tr key={item.id} className="hover:bg-blue-50 transition">
                                                                        <td className="px-4 py-4 text-gray-700">
                                                                            {orderTime.toLocaleTimeString('en-IN', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                                hour12: true
                                                                            })}
                                                                        </td>
                                                                        <td className="px-4 py-4 font-semibold text-gray-900">
                                                                            {item.orderId ? `#${item.orderId}` : item.id ? `#${item.id.slice(-8)}` : 'N/A'}
                                                                        </td>
                                                                        <td className="px-4 py-4">
                                                                            <div className="text-gray-900">
                                                                                {item.cartItems?.length} item{item.cartItems?.length > 1 ? 's' : ''}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {item.cartItems?.map(cartItem => (
                                                                                    <div key={`${item.id}-${cartItem.id || cartItem.title}`}>
                                                                                        {cartItem.title} x {cartItem.quantity}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-4 font-bold text-green-700">
                                                                            {(() => {
                                                                                let subtotal = typeof item.subtotal === 'number' ? item.subtotal : 
                                                                                    (item.cartItems ? item.cartItems.reduce((t, i) => t + (i.price * (i.quantity || 1)), 0) : 0);
                                                                                let delivery = typeof item.deliveryCharges === 'number' ? item.deliveryCharges : 
                                                                                    (typeof item.grandTotal === 'number' && typeof item.subtotal === 'number' ? 
                                                                                        (item.grandTotal - item.subtotal) : 0);
                                                                                let total = typeof item.grandTotal === 'number' ? item.grandTotal : (subtotal + delivery);
                                                                                return `₹${total.toFixed(2)}`;
                                                                            })()}
                                                                        </td>
                                                                        <td className="px-4 py-4">
                                                                            <div className="flex gap-2 items-center">
                                                                                {statusSteps.map((step, i) => (
                                                                                    <button
                                                                                        key={`${item.id}-${step.value}`}
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
                        ))}
                    </div>
                </>
            )}

            {/* Cancel Order Modal */}
            {cancelOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative">
                        <button 
                            onClick={() => setCancelOrderId(null)} 
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        >
                            &times;
                        </button>
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
        </div>
    );
};

export default Orders; 