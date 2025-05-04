import React, { useContext, useEffect } from 'react';
import myContext from '../../context/data/myContext';
import Layout from '../../components/layout/Layout';
import Loader from '../../components/loader/Loader';
import { Package } from 'lucide-react';

function Order() {
  const userData = JSON.parse(localStorage.getItem('user'));
  const userid = userData?.user?.uid;
  const context = useContext(myContext);
  const { mode, loading, order } = context;

  useEffect(() => {
    console.log("User ID:", userid);
    console.log("Order Data:", order);
  }, [userid, order]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateOrderTotal = (cartItems) => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  if (loading) return <Layout><Loader /></Layout>;

  const userOrders = order.filter(obj => obj.userid === userid);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8" style={{
        backgroundColor: mode === 'dark' ? '#282c34' : '',
        color: mode === 'dark' ? 'white' : '',
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">My Orders</h1>
            <p className="text-sm text-gray-500" style={{ color: mode === 'dark' ? '#9CA3AF' : '' }}>
              {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </div>

          {userOrders.length > 0 ? (
            <div className="space-y-8">
              {userOrders.map((orderItem) => (
                <div
                  key={orderItem.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  style={{
                    backgroundColor: mode === 'dark' ? '#1F2937' : '',
                    color: mode === 'dark' ? 'white' : '',
                  }}
                >
                  {/* Order Header */}
                  <div className="border-b border-gray-200 p-4 sm:px-6"
                    style={{ borderColor: mode === 'dark' ? '#374151' : '' }}>
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="mb-2 sm:mb-0">
                        <span className="text-xs text-gray-500" style={{ color: mode === 'dark' ? '#9CA3AF' : '' }}>
                          ORDER PLACED
                        </span>
                        <div className="text-sm font-medium">
                          {formatDate(orderItem.timestamp)}
                        </div>
                      </div>
                      <div className="mb-2 sm:mb-0">
                        <span className="text-xs text-gray-500" style={{ color: mode === 'dark' ? '#9CA3AF' : '' }}>
                          TOTAL
                        </span>
                        <div className="text-sm font-medium">
                          ₹{calculateOrderTotal(orderItem.cartItems).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500" style={{ color: mode === 'dark' ? '#9CA3AF' : '' }}>
                          ORDER ID
                        </span>
                        <div className="text-sm font-medium">
                          {orderItem.id ? `#${orderItem.id.slice(-8)}` : 'N/A'}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-200" style={{ borderColor: mode === 'dark' ? '#374151' : '' }}>
                    {orderItem.cartItems.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full sm:w-24 h-24 object-cover rounded-md"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="text-lg font-medium mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2" style={{ color: mode === 'dark' ? '#9CA3AF' : '' }}>
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium">
                                ₹{item.price}
                              </span>
                              <span className="text-sm text-gray-500" style={{ color: mode === 'dark' ? '#9CA3AF' : '' }}>
                                Qty: {item.quantity || 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-sm text-gray-500" style={{ color: mode === 'dark' ? '#9CA3AF' : '' }}>
                You haven't placed any orders yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Order;