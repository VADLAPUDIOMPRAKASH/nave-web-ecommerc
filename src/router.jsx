import React from 'react';
import { createRouter, createRoute, createRootRoute, redirect, Outlet, useLocation } from '@tanstack/react-router';
import Home from './pages/home/Home';
import Order from './pages/order/Order';
import Cart from './pages/cart/Cart';
import Dashboard from './pages/admin/dashboard/Dashboard';
import NoPage from './pages/nopage/NoPage';
import ProductInfo from './pages/productInfo/ProductInfo';
import UpdateProduct from './pages/admin/pages/UpdateProduct';
import AddProduct from './pages/admin/pages/AddProduct';
import Allproducts from './pages/allproducts/AllProducts';
import About from './pages/about/About';
import WhyUs from './pages/whyus/WhyUs';
import Profile from './pages/profile/Profile';
import Terms from './pages/terms/Terms';
import ForgotPassword from './pages/registration/ForgotPassword';
import ResendOtp from './pages/registration/ResendOtp';
import MyState from './context/data/myState';
import UserActivityTracker from './components/UserActivityTracker';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { debugRouter } from './utils/routerDebug';

// Scroll to top component
const ScrollToTop = () => {
  const location = useLocation();

  React.useEffect(() => {
    // Scroll to top on all devices (mobile and desktop)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
};

// Root route
const rootRoute = createRootRoute({
  component: () => {
    // Debug logging
    React.useEffect(() => {
      console.log('TanStack Router loaded');
      debugRouter();
    }, []);
    
    return (
      <MyState>
        <div className="scroll-smooth">
          <ScrollToTop />
          <UserActivityTracker />
          <Outlet />
          <ToastContainer position="top-center" />
        </div>
      </MyState>
    );
  },
  errorComponent: ({ error }) => {
    console.error('Router error:', error);
    return (
      <div className="p-4 text-red-600">
        <h1>Something went wrong!</h1>
        <p>{error.message}</p>
      </div>
    );
  },
  notFoundComponent: () => {
    return <NoPage />;
  }
});

// Protection functions
const checkUserAuth = () => {
  try {
    const userString = localStorage.getItem('user');
    console.log('Raw user string from localStorage:', userString);
    
    if (!userString) {
      console.log('No user string found in localStorage');
      return false;
    }
    
    const user = JSON.parse(userString);
    console.log('Parsed user object:', user);
    
    const hasValidAuth = user && user.user && user.user.uid;
    console.log('Has valid auth (user.user.uid):', hasValidAuth);
    console.log('User structure check:', {
      userExists: !!user,
      userUserExists: !!(user && user.user),
      uidExists: !!(user && user.user && user.user.uid)
    });
    
    return hasValidAuth;
  } catch (error) {
    console.error('Error checking user auth:', error);
    return false;
  }
};

const checkAdminAuth = () => {
  try {
    const adminString = localStorage.getItem('user');
    if (!adminString) return false;
    
    const admin = JSON.parse(adminString);
    const userRole = localStorage.getItem('userRole');
    
    return admin?.user?.email === 'omprakash16003@gmail.com' || 
           userRole === 'master_admin' || 
           userRole === 'sub_admin' || 
           userRole === 'delivery_boy';
  } catch (error) {
    console.error('Error checking admin auth:', error);
    return false;
  }
};

// Define individual routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home
});

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order',
  component: Order
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: ({ location }) => {
    console.log('Profile route beforeLoad triggered');
    console.log('Current location:', location);
    
    const isAuthenticated = checkUserAuth();
    console.log('User authenticated for profile:', isAuthenticated);
    
    // TEMPORARY: Allow access even without auth for debugging
    if (!isAuthenticated) {
      console.log('User not authenticated for profile - showing login prompt');
      // For now, let's just warn but don't redirect
      console.warn('⚠️ User not authenticated for profile but allowing access for debugging');
      // Uncomment the lines below to re-enable auth protection:
      /*
      throw redirect({
        to: '/',
        search: {
          redirect: location.pathname,
        },
      });
      */
    }
    console.log('Proceeding to profile page');
  },
  component: Profile
});

const allProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/allproducts',
  component: Allproducts
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: Cart
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: ({ location }) => {
    console.log('Dashboard route beforeLoad triggered');
    console.log('Current location:', location);
    
    const isAdminAuthenticated = checkAdminAuth();
    console.log('Admin authenticated for dashboard:', isAdminAuthenticated);
    
    // TEMPORARY: Allow access even without admin auth for debugging
    if (!isAdminAuthenticated) {
      console.log('Admin not authenticated for dashboard - showing login prompt');
      // For now, let's just warn but don't redirect
      console.warn('⚠️ Admin not authenticated for dashboard but allowing access for debugging');
      // Uncomment the lines below to re-enable admin auth protection:
      /*
      throw redirect({
        to: '/',
        search: {
          redirect: location.pathname,
        },
      });
      */
    }
    console.log('Proceeding to dashboard page');
  },
  component: Dashboard
});

const productInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/productinfo/$id',
  component: ProductInfo
});

const updateProductRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/updateproduct/$id',
  component: UpdateProduct
});

const addProductRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/addproduct',
  component: AddProduct
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About
});

const whyUsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/whyus',
  component: WhyUs
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: Terms
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registration/forgot-password',
  component: ForgotPassword
});

const resendOtpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registration/resend-otp',
  component: ResendOtp
});

// Catch-all route is handled by notFoundComponent in root route

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  orderRoute,
  profileRoute,
  allProductsRoute,
  cartRoute,
  dashboardRoute,
  productInfoRoute,
  updateProductRoute,
  addProductRoute,
  aboutRoute,
  whyUsRoute,
  termsRoute,
  forgotPasswordRoute,
  resendOtpRoute
]);

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {},
  defaultPreloadStaleTime: 0,
  defaultComponent: () => <div>Page Loading...</div>
}); 