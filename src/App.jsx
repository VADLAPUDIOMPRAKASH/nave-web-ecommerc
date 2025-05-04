import React from 'react';
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

function App() {
  return (
    <MyState>
      <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={
              <ProtectedRoute>
                <Order />
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
            <Route path="/updateproduct" element={<UpdateProduct />} />
            <Route path="/addproduct" element={<AddProduct />} />
            <Route path="/about" element={<About />} />
            <Route path="/whyus" element={<WhyUs />} />
            <Route path="*" element={<Nopage />} />
          </Routes>
          <ToastContainer position="top-center" />
      </Router>
    </MyState>
  );
}

export default App;

//user
export const ProtectedRoute = ({children}) => {
  const user = localStorage.getItem('user')
  if(user){
    return children
  } else {
    return <Navigate to="/" />
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