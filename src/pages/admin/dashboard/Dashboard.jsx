import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import myContext from '../../../context/data/myContext';
import { fireDB } from '../../../firebase/FirebaseConfig';
import DashboardTab from './DashboardTab';
import UpdateBanners from '../pages/UpdateBanners';
import AddProduct from '../pages/AddProduct';
import DeliveryDashboard from '../delivery/DeliveryDashboard';

function Dashboard() {
    const context = useContext(myContext);
    const { mode } = context;
    const navigate = useNavigate();

    const [productCount, setProductCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const productsSnapshot = await getDocs(collection(fireDB, 'products'));
                setProductCount(productsSnapshot.size);

                const ordersSnapshot = await getDocs(collection(fireDB, 'orders'));
                setOrderCount(ordersSnapshot.size);

                const usersSnapshot = await getDocs(collection(fireDB, 'users'));
                setUserCount(usersSnapshot.size);

                // Calculate total revenue from orders
                let revenue = 0;
                ordersSnapshot.forEach(doc => {
                    const orderData = doc.data();
                    if (orderData.totalAmount) {
                        revenue += parseFloat(orderData.totalAmount);
                    }
                });
                setTotalRevenue(revenue);
            } catch (error) {
                console.error("Error fetching counts:", error);
            }
        };

        fetchCounts();
    }, []);

    const handleLogout = () => {
        localStorage.clear('user');
        navigate('/');
    };

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'delivery', label: 'Delivery Dashboard', icon: MapPin },
        { id: 'addproduct', label: 'Add Product', icon: Plus },
        { id: 'banners', label: 'Update Banners', icon: ImageIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'delivery':
                return <DeliveryDashboard />;
            case 'addproduct':
                return <AddProduct />;
            case 'banners':
                return <UpdateBanners />;
            default:
                return <DashboardTab activeTab={activeTab} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 shadow-2xl ${sidebarOpen ? 'w-64' : 'w-20'} rounded-r-3xl border-r-4 border-blue-300 z-30 transition-all duration-300`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Toggle */}
                    <button
                        className={`fixed z-20 left-0 top-6 bg-blue-700 border-2 border-blue-400 rounded-full p-1 shadow-lg transition-all ${sidebarOpen ? '' : 'rotate-180'}`}
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
                    </button>
                    {/* Logo/Avatar */}
                    <div className={`p-4 flex ${sidebarOpen ? 'flex-row items-center justify-start gap-2' : 'flex-col items-center'} border-b border-blue-500`}>
                        <img src="/logo.png" alt="NaveDhana Logo" className="w-12 h-12 rounded-xl shadow border-2 border-white" />
                        {sidebarOpen && (
                            <h1 className="text-xs font-semibold text-white tracking-wide drop-shadow ml-2">NaveDhana Admin</h1>
                        )}
                    </div>
                    {/* Navigation Section Header */}
                    {/* Navigation */}
                    <nav className={`flex-1 p-4 space-y-2 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
                        {menuItems.map((item, idx) => {
                            if (item.id === 'addproduct' || item.id === 'banners') return null;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center ${sidebarOpen ? 'w-full px-4 py-3' : 'justify-center w-12 h-12 my-2'} rounded-xl transition-all text-sm font-medium gap-3 shadow-sm
                                        ${activeTab === item.id
                                            ? 'bg-white text-blue-700 shadow-lg border-l-8 border-blue-400 ring-2 ring-blue-200'
                                            : 'text-white hover:bg-blue-500 hover:shadow-md hover:border-l-8 hover:border-blue-300'}
                                    `}
                                    title={!sidebarOpen ? item.label : ''}
                                    style={{ minHeight: 48 }}
                                >
                                    <Icon className="w-6 h-6" />
                                    {sidebarOpen && <span className="ml-2 text-xs font-semibold">{item.label}</span>}
                                </button>
                            );
                        })}
                        {/* Section Header for Actions */}
                        {sidebarOpen && <div className="px-6 pt-6 pb-2 text-xs font-bold text-blue-200 tracking-widest uppercase">Actions</div>}
                        {/* Add Product & Banners */}
                        {menuItems.filter(i => i.id === 'addproduct' || i.id === 'banners').map(item => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center ${sidebarOpen ? 'w-full px-4 py-3' : 'justify-center w-12 h-12 my-2'} rounded-xl transition-all text-sm font-medium gap-3 shadow-sm
                                        ${activeTab === item.id
                                            ? 'bg-white text-blue-700 shadow-lg border-l-8 border-blue-400 ring-2 ring-blue-200'
                                            : 'text-white hover:bg-blue-500 hover:shadow-md hover:border-l-8 hover:border-blue-300'}
                                    `}
                                    title={!sidebarOpen ? item.label : ''}
                                    style={{ minHeight: 48 }}
                                >
                                    <Icon className="w-6 h-6" />
                                    {sidebarOpen && <span className="ml-2 text-xs font-semibold">{item.label}</span>}
                                </button>
                            );
                        })}
                        {/* Separator */}
                        <div className={`border-t border-blue-500 my-4 ${sidebarOpen ? 'mx-4' : 'w-8'}`}></div>
                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center ${sidebarOpen ? 'w-full px-4 py-3' : 'justify-center w-12 h-12 my-2'} rounded-xl transition-all text-sm font-medium gap-3 shadow-sm text-white hover:bg-red-500`}
                            title={!sidebarOpen ? 'Logout' : ''}
                            style={{ minHeight: 48 }}
                        >
                            <LogOut className="w-6 h-6" />
                            {sidebarOpen && <span className="ml-2 text-xs font-semibold">Logout</span>}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto" style={{ marginLeft: sidebarOpen ? 256 : 80, transition: 'margin-left 0.3s' }}>
                <div className="p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        {/* Products Stats */}
                        <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-blue-200 to-blue-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-900 font-semibold opacity-80">Total Products</p>
                                <h3 className="text-3xl font-extrabold text-blue-900">{productCount}</h3>
                            </div>
                            <Package className="w-14 h-14 text-blue-500 opacity-80" />
                        </div>
                        {/* Orders Stats */}
                        <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-cyan-200 to-cyan-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-900 font-semibold opacity-80">Total Orders</p>
                                <h3 className="text-3xl font-extrabold text-cyan-900">{orderCount}</h3>
                            </div>
                            <ShoppingCart className="w-14 h-14 text-cyan-500 opacity-80" />
                        </div>
                        {/* Users Stats */}
                        <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-indigo-200 to-indigo-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-900 font-semibold opacity-80">Total Users</p>
                                <h3 className="text-3xl font-extrabold text-indigo-900">{userCount}</h3>
                            </div>
                            <Users className="w-14 h-14 text-indigo-500 opacity-80" />
                        </div>
                        {/* Revenue Stats */}
                        <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-sky-200 to-sky-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-sky-900 font-semibold opacity-80">Total Revenue</p>
                                <h3 className="text-3xl font-extrabold text-sky-900">₹{totalRevenue.toFixed(2)}</h3>
                            </div>
                            <TrendingUp className="w-14 h-14 text-sky-500 opacity-80" />
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="rounded-2xl shadow-2xl bg-white p-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
