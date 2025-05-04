import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
    Pencil, 
    Trash2, 
    Plus,
    Search,
    ArrowUpDown,
    MoreVertical,
    FileSpreadsheet
} from 'lucide-react';
import myContext from '../../../context/data/myContext';

function DashboardTab({ activeTab }) {
    const context = useContext(myContext);
    const { mode, product, edithandle, deleteProduct, order, user } = context;

    const renderOverview = () => (
        <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-6 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Overview
            </h2>
            <div className="space-y-4">
                <div className={`p-4 rounded-lg ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium mb-2 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Recent Activity
                    </h3>
                    {/* Add recent activity content here */}
                </div>
                <div className={`p-4 rounded-lg ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium mb-2 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link to="/addproduct" className="flex items-center p-3 rounded-lg bg-green-500 text-white hover:bg-green-600">
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Product
                        </Link>
                        <button className="flex items-center p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                            <FileSpreadsheet className="w-5 h-5 mr-2" />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-semibold ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Products
                </h2>
                <Link
                    to="/addproduct"
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </Link>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                            mode === 'dark' 
                                ? 'bg-gray-700 text-white placeholder-gray-400' 
                                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                        }`}
                    />
                    <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                </div>
                <button className={`p-2 rounded-lg ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <ArrowUpDown className="w-5 h-5" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`text-left ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <th className="p-4 font-medium">Product</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {product.map((item, index) => (
                            <tr key={index} className={`border-t ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover mr-3" />
                                        <span className={mode === 'dark' ? 'text-white' : 'text-gray-900'}>{item.title}</span>
                                    </div>
                                </td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{item.price}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.category}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.date}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/updateproduct"
                                            onClick={() => edithandle(item)}
                                            className={`p-2 rounded-lg ${mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => deleteProduct(item)}
                                            className={`p-2 rounded-lg ${mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                        >
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </button>
                                        <button className={`p-2 rounded-lg ${mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-6 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Orders
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`text-left ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <th className="p-4 font-medium">Order ID</th>
                            <th className="p-4 font-medium">Customer</th>
                            <th className="p-4 font-medium">Products</th>
                            <th className="p-4 font-medium">Total</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.map((item, index) => (
                            <tr key={index} className={`border-t ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>#{item.paymentId || index + 1}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.addressInfo?.name}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {item.cartItems?.length} items
                                </td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{item.totalAmount}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.date}</td>
                                <td className="p-4">
                                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                        Delivered
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-6 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Users
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`text-left ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">User ID</th>
                            <th className="p-4 font-medium">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {user.map((item, index) => (
                            <tr key={index} className={`border-t ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.email}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.uid}</td>
                                <td className={`p-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-6 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Analytics
            </h2>
            {/* Add analytics content here */}
        </div>
    );

    const renderSettings = () => (
        <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-6 ${mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Settings
            </h2>
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

    return renderContent();
}

export default DashboardTab;