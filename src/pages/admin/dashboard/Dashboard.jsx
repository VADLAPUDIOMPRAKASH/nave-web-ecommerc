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
  Plus
} from 'lucide-react';
import myContext from '../../../context/data/myContext';
import { fireDB } from '../../../firebase/FirebaseConfig';
import DashboardTab from './DashboardTab';

function Dashboard() {
    const context = useContext(myContext);
    const { mode } = context;
    const navigate = useNavigate();

    const [productCount, setProductCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [totalRevenue, setTotalRevenue] = useState(0);

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
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className={`w-64 ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            NaveDhana Admin
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                                        activeTab === item.id
                                            ? 'bg-green-500 text-white'
                                            : `${mode === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <button
                            onClick={() => navigate('/addproduct')}
                            className="flex items-center w-full px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-3" />
                            Add Product
                        </button>
                        <button
                            onClick={handleLogout}
                            className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                                mode === 'dark'
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Products Stats */}
                        <div className={`p-6 rounded-lg shadow-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Total Products
                                    </p>
                                    <h3 className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {productCount}
                                    </h3>
                                </div>
                                <Package className="w-12 h-12 text-green-500" />
                            </div>
                        </div>

                        {/* Orders Stats */}
                        <div className={`p-6 rounded-lg shadow-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Total Orders
                                    </p>
                                    <h3 className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {orderCount}
                                    </h3>
                                </div>
                                <ShoppingCart className="w-12 h-12 text-blue-500" />
                            </div>
                        </div>

                        {/* Users Stats */}
                        <div className={`p-6 rounded-lg shadow-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Total Users
                                    </p>
                                    <h3 className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {userCount}
                                    </h3>
                                </div>
                                <Users className="w-12 h-12 text-purple-500" />
                            </div>
                        </div>

                        {/* Revenue Stats */}
                        <div className={`p-6 rounded-lg shadow-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Total Revenue
                                    </p>
                                    <h3 className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        ₹{totalRevenue.toFixed(2)}
                                    </h3>
                                </div>
                                <TrendingUp className="w-12 h-12 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className={`rounded-lg shadow-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <DashboardTab activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
