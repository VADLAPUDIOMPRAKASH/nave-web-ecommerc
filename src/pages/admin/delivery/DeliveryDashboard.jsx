import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../../../firebase/FirebaseConfig';
import { RefreshCw, Search, Filter, ListOrdered, MapPin, Phone, CheckCircle, ShoppingBag, Users } from 'lucide-react';

function groupOrdersByDate(orders) {
  // Group orders by their 'date' field
  const groups = {};
  orders.forEach(order => {
    const date = order.date || 'Unknown Date';
    if (!groups[date]) groups[date] = [];
    groups[date].push(order);
  });
  // Sort dates descending (most recent first)
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
  return { groups, sortedDates };
}

function groupOrdersByArea(orders) {
  // Group orders by pincode (or address if pincode missing)
  const groups = {};
  orders.forEach(order => {
    const area = order.addressInfo?.pincode || order.addressInfo?.address || 'Unknown Area';
    if (!groups[area]) groups[area] = [];
    groups[area].push(order);
  });
  // Sort areas by order count descending
  const sortedAreas = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  return { groups, sortedAreas };
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [tab, setTab] = useState(0); // 0: Date-wise, 1: Area-wise
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // pending, delivered, all
  const [expandedArea, setExpandedArea] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(fireDB, 'orders'));
    const allOrders = [];
    querySnapshot.forEach(docSnap => {
      allOrders.push({ id: docSnap.id, ...docSnap.data() });
    });
    setOrders(allOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const handleMarkDelivered = async (orderId) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateDoc(doc(fireDB, 'orders', orderId), { status: 'delivered' });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleMarkAllDelivered = async (orderIds) => {
    for (const orderId of orderIds) {
      await handleMarkDelivered(orderId);
    }
  };

  // Filter orders by status and search
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = order.addressInfo?.name?.toLowerCase() || '';
      const phone = order.addressInfo?.phoneNumber || '';
      if (!name.includes(s) && !phone.includes(s)) return false;
    }
    return true;
  });

  // Grouped data
  const { groups: dateGroups, sortedDates } = groupOrdersByDate(filteredOrders);
  const { groups: areaGroups, sortedAreas } = groupOrdersByArea(filteredOrders);

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-5xl mx-auto">
        {/* Tabs and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-green-700 text-center sm:text-left flex items-center gap-2">
            <ListOrdered className="w-7 h-7" /> Delivery Dashboard
          </h1>
          <div className="flex gap-2 items-center justify-center">
            <button onClick={fetchOrders} className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition" title="Refresh">
              <RefreshCw className="w-5 h-5 text-green-700" />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 text-sm"
              />
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all ${tab === 0 ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 bg-gray-50'}`}
              onClick={() => setTab(0)}
            >
              Date-wise Orders
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all ${tab === 1 ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 bg-gray-50'}`}
              onClick={() => setTab(1)}
            >
              Area-wise Orders
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-lg">Loading orders...</div>
        ) : (
          <div>
            {tab === 0 && (
              <div className="space-y-10">
                {sortedDates.length === 0 ? (
                  <div className="text-gray-500 text-center">No orders found.</div>
                ) : (
                  sortedDates.map(date => (
                    <div key={date}>
                      <div className="text-lg font-bold text-green-800 mb-4 border-b border-green-100 pb-1">{date}</div>
                      <div className="space-y-6">
                        {dateGroups[date].map(order => (
                          <OrderCard key={order.id} order={order} updating={updating} handleMarkDelivered={handleMarkDelivered} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {tab === 1 && (
              <div className="space-y-8">
                {sortedAreas.length === 0 ? (
                  <div className="text-gray-500 text-center">No orders found.</div>
                ) : (
                  sortedAreas.map(area => (
                    <div key={area} className="mb-8">
                      <div
                        className="flex items-center justify-between bg-white rounded-xl shadow-lg px-6 py-4 border border-gray-200 cursor-pointer transition hover:shadow-xl"
                        onClick={() => setExpandedArea(prev => ({ ...prev, [area]: !prev[area] }))}
                      >
                        <div className="flex items-center gap-4">
                          <MapPin className="w-7 h-7 text-green-600" />
                          <div>
                            <div className="font-bold text-lg text-green-900">{area}</div>
                            {areaGroups[area][0]?.addressInfo?.city && (
                              <div className="text-xs text-blue-700">{areaGroups[area][0].addressInfo.city}</div>
                            )}
                          </div>
                          <span className="ml-4 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            {areaGroups[area].length} orders
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                            Pending: {areaGroups[area].filter(o => o.status !== 'delivered').length}
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs font-semibold">
                            Delivered: {areaGroups[area].filter(o => o.status === 'delivered').length}
                          </span>
                        </div>
                        <button
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white font-bold shadow hover:bg-green-700 transition text-xs"
                          onClick={e => { e.stopPropagation(); handleMarkAllDelivered(areaGroups[area].filter(o => o.status !== 'delivered').map(o => o.id)); }}
                          disabled={areaGroups[area].every(o => o.status === 'delivered')}
                          title="Mark all as delivered"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark All Delivered
                        </button>
                      </div>
                      {expandedArea[area] && (
                        <div className="grid gap-6 mt-4 sm:grid-cols-2">
                          {areaGroups[area].map(order => (
                            <OrderCard key={order.id} order={order} updating={updating} handleMarkDelivered={handleMarkDelivered} modernUI />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, updating, handleMarkDelivered }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-200 flex flex-col gap-3 hover:shadow-xl transition">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs text-gray-400 font-semibold">ORDER ID</div>
          <div className="font-bold text-green-700 text-lg">{order.orderId ? `#${order.orderId}` : `#${order.id}`}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {order.cartItems?.slice(0, 3).map((item, idx) => (
          item.imageUrl ? <img key={idx} src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded object-cover border" /> : null
        ))}
        {order.cartItems?.length > 3 && (
          <span className="text-xs text-gray-500">+{order.cartItems.length - 3} more</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xs text-gray-400 font-semibold">CUSTOMER</div>
        <div className="font-semibold text-gray-800">{order.addressInfo?.name}</div>
        {order.addressInfo?.phoneNumber && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">Phone:</span>
            <a href={`tel:${order.addressInfo.phoneNumber}`} className="text-green-700 underline text-sm">{order.addressInfo.phoneNumber}</a>
          </div>
        )}
        {order.addressInfo?.alternatePhone && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">Alt:</span>
            <a href={`tel:${order.addressInfo.alternatePhone}`} className="text-green-700 underline text-sm">{order.addressInfo.alternatePhone}</a>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xs text-gray-400 font-semibold">ADDRESS</div>
        <div className="text-gray-700">{order.addressInfo?.houseNo}, {order.addressInfo?.blockNo}, {order.addressInfo?.landmark}, {order.addressInfo?.address}, {order.addressInfo?.pincode}</div>
        <div className="flex items-center gap-2 mt-1">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${order.addressInfo?.houseNo || ''} ${order.addressInfo?.blockNo || ''} ${order.addressInfo?.landmark || ''} ${order.addressInfo?.address || ''} ${order.addressInfo?.pincode || ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-xs"
          >
            View Map
          </a>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-xs text-gray-500">Order Date: {order.date ? order.date : 'N/A'}</span>
        
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white font-bold shadow hover:bg-green-700 transition disabled:opacity-60"
          onClick={() => handleMarkDelivered(order.id)}
          disabled={updating[order.id] || order.status === 'delivered'}
        >
          <CheckCircle className="w-5 h-5" /> {order.status === 'delivered' ? 'Delivered' : 'Mark as Delivered'}
        </button>
      </div>
    </div>
  );
} 