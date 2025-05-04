import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Leaf, ShoppingBag, ArrowLeft } from 'lucide-react';
import { deleteFromCart, incrementQuantity, decrementQuantity, clearCart} from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig.jsx';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/modal/Modal';
import myContext from '../../context/data/myContext';
import { Link } from 'react-router-dom';

function Cart() {
  const context = useContext(myContext);
  const { mode } = context;
  const dispatch = useDispatch();
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const cartItems = useSelector((state) => state.cart);
  
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  // Constants for quantity management
  const MIN_QUANTITY = 0.25;
  const QUANTITY_STEP = 0.25;

  useEffect(() => {
    let tempAmount = 0;
    let tempWeight = 0;
    cartItems.forEach((item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || MIN_QUANTITY;
      const itemWeight = Number(item.weight) || 0;
      
      tempAmount += itemPrice * itemQuantity;
      tempWeight += itemWeight * itemQuantity;
    });
    setTotalAmount(tempAmount);
    setTotalWeight(tempWeight);
  }, [cartItems]);

  const grandTotal = totalAmount;

  const deleteFromCartHandler = (item) => {
    dispatch(deleteFromCart(item));
    toast.success('Item removed from cart');
  };

  const handleIncrement = (item) => {
    const newQuantity = Number((Number(item.quantity || MIN_QUANTITY) + QUANTITY_STEP).toFixed(2));
    dispatch(incrementQuantity({ ...item, quantity: newQuantity }));
  };

  const handleDecrement = (item) => {
    const currentQuantity = Number(item.quantity || MIN_QUANTITY);
    
    if (currentQuantity > MIN_QUANTITY) {
      const newQuantity = Number((currentQuantity - QUANTITY_STEP).toFixed(2));
      dispatch(decrementQuantity({ ...item, quantity: newQuantity }));
    } else {
      dispatch(deleteFromCart(item));
      toast.success('Item removed from cart');
    }
  };

  const buyNow = async () => {
    if (!name || !address || !pincode || !phoneNumber) {
      toast.error("All fields are required", { position: "top-center", autoClose: 1000, theme: "colored" });
      return;
    }
  
    try {
      const addressInfo = {
        name,
        address,
        pincode,
        phoneNumber,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      };
  
      await addDoc(collection(fireDB, "orders"), { ...addressInfo, cartItems, totalAmount, grandTotal });
      toast.success("Order placed successfully!");
  
      dispatch(clearCart());
      localStorage.removeItem('cart');
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    }
  };
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-24" style={{ 
        backgroundColor: mode === 'dark' ? '#282c34' : '', 
        color: mode === 'dark' ? 'white' : '' 
      }}>
        {/* Header */}
        <div className="bg-gray-50 shadow-sm mb-6" style={{ 
          backgroundColor: mode === 'dark' ? '#282c34' : ''
        }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Continue Shopping</span>
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <h1 className="text-lg font-semibold">Shopping Cart</h1>
              </div>
              <div className="w-20 sm:w-32"></div> {/* Spacer for balance */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-8">
          <div className="lg:flex lg:gap-6">
            {/* Cart Items Section */}
            <div className="lg:w-2/3">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm" style={{
                  backgroundColor: mode === 'dark' ? 'rgb(32 33 34)' : ''
                }}>
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
                  <p className="text-sm text-gray-500 mb-4" style={{ color: mode === 'dark' ? '#999' : '' }}>
                    Add some fresh vegetables to your cart
                  </p>
                  <Link 
                    to="/allproducts"
                    className="inline-block bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3" style={{
                      backgroundColor: mode === 'dark' ? 'rgb(32 33 34)' : '',
                      color: mode === 'dark' ? 'white' : ''
                    }}>
                      {/* Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {item.isCleaned && (
                          <span className="absolute -top-1 -right-1 bg-green-100 text-green-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                            Clean
                          </span>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm sm:text-base truncate">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate" style={{ color: mode === 'dark' ? '#999' : '' }}>
                              {item.isCleaned ? 'Cleaned and Ready to Cook' : 'Fresh from Farm'}
                            </p>
                          </div>
                          <button 
                            onClick={() => deleteFromCartHandler(item)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                            style={{ backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDecrement(item)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              style={{ backgroundColor: mode === 'dark' ? '#444' : '' }}
                            >
                              -
                            </button>
                            <span className="w-16 sm:w-20 text-center text-sm sm:text-base">
                              {Number(item.quantity || MIN_QUANTITY).toFixed(2)}kg
                            </span>
                            <button 
                              onClick={() => handleIncrement(item)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              style={{ backgroundColor: mode === 'dark' ? '#444' : '' }}
                            >
                              +
                            </button>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="font-medium text-sm sm:text-base">
                              ₹{(Number(item.price) * Number(item.quantity || MIN_QUANTITY)).toFixed(2)}
                            </p>
                            {item.actualprice > item.price && (
                              <p className="text-xs sm:text-sm text-gray-500 line-through" style={{ color: mode === 'dark' ? '#999' : '' }}>
                                ₹{(Number(item.actualprice) * Number(item.quantity || MIN_QUANTITY)).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary Section */}
            <div className="lg:w-1/3 mt-6 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-[84px]" style={{
                backgroundColor: mode === 'dark' ? 'rgb(32 33 34)' : '',
                color: mode === 'dark' ? 'white' : ''
              }}>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600" style={{ color: mode === 'dark' ? '#999' : '' }}>Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600" style={{ color: mode === 'dark' ? '#999' : '' }}>Total Weight</span>
                    <span>{totalWeight.toFixed(2)} kg</span>
                  </div>
                  
                  <div className="h-px bg-gray-200 my-3" style={{ backgroundColor: mode === 'dark' ? '#374151' : '' }}></div>
                  
                  <div className="flex justify-between text-base sm:text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Modal
                  name={name}
                  address={address}
                  pincode={pincode}
                  phoneNumber={phoneNumber}
                  setName={setName}
                  setAddress={setAddress}
                  setPincode={setPincode}
                  setPhoneNumber={setPhoneNumber}
                  cartItems={cartItems}
                  totalAmount={totalAmount}
                />
                
                <div className="mt-4 text-xs sm:text-sm text-gray-500" style={{ color: mode === 'dark' ? '#999' : '' }}>
                  <div className="flex items-center gap-1 mb-1">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span>Free delivery on orders over 5kg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4 text-green-600" />
                    <span>All vegetables are fresh from local farmers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Cart;