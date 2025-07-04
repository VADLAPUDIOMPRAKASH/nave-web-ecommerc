import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import Home from './pages/home/Home';
import Order from './pages/order/Order';
import Cart from './pages/cart/Cart';
import Dashboard from './pages/admin/dashboard/Dashboard';
import Nopage from './pages/nopage/NoPage';
import MyState from './context/data/myState';
import ProductInfo from './pages/productInfo/ProductInfo';
import UpdateProduct from './pages/admin/pages/UpdateProduct.jsx';
import AddProduct from './pages/admin/pages/AddProduct';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Allproducts from './pages/allproducts/AllProducts.jsx';
import About from './pages/about/About.jsx';
import WhyUs from './pages/whyus/WhyUs.jsx';  
import Profile from './pages/profile/Profile.jsx';
import UserActivityTracker from './components/UserActivityTracker';
import Loader from './components/loader/Loader';
import Terms from './pages/terms/Terms.jsx';
import ForgotPassword from './pages/registration/ForgotPassword';
import ResendOtp from './pages/registration/ResendOtp';

function App() {
  const [showNotice, setShowNotice] = useState(true);

  const handleNoticeOkay = () => {
    setShowNotice(false);
  };

  return (
    <MyState>
      <div className="scroll-smooth">
        {showNotice && (
          <>
           
          </>
        )}
        <Router>
          <UserActivityTracker />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/order" element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/allproducts" element={<Allproducts />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/dashboard" element={
                <ProtectedRouteForAdmin>
                  <Dashboard />
                </ProtectedRouteForAdmin>
              } />
              <Route path="/productinfo/:id" element={<ProductInfo />} />
            <Route path="/updateproduct/:id" element={<UpdateProduct />} />
              <Route path="/addproduct" element={<AddProduct />} />
              <Route path="/about" element={<About />} />
              <Route path="/whyus" element={<WhyUs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/registration/forgot-password" element={<ForgotPassword />} />
              <Route path="/registration/resend-otp" element={<ResendOtp />} />
              <Route path="*" element={<Nopage />} />
            </Routes>
            <ToastContainer position="top-center" />
        </Router>
      </div>
    </MyState>
  );
}

export default App;

//user
export const ProtectedRoute = ({children}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if(user && user.user && user.user.uid){
    return children;
  } else {
    return <Navigate to="/" />;
  }
}

//admin
export const ProtectedRouteForAdmin = ({children}) => {
  const admin = JSON.parse(localStorage.getItem('user'))
  if(admin?.user?.email === 'omprakash16003@gmail.com'){
    return children
  } else {
    return <Navigate to="/" />
  }
}
