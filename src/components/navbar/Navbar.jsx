import { Fragment, useContext, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, ShoppingCart, X, Home, ShoppingBag, HelpCircle, Info, Package, LayoutDashboard } from 'lucide-react'
import { useSelector } from 'react-redux'
import myContext from '../../context/data/myContext'
import AuthModal from '../auth/AuthModal'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const cartItems = useSelector((state) => state.cart)
  const user = JSON.parse(localStorage.getItem('user'))
  const location = useLocation()

  const logout = () => {
    localStorage.clear('user')
    window.location.href = "/"
  }

  const context = useContext(myContext)
  const { toggleMode, mode } = context

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/allproducts' },
    { name: 'Why Us', path: '/whyus' },
    { name: 'About', path: '/about' },
  ]

  if (user) {
    navLinks.splice(2, 0, { name: 'Orders', path: '/order' })
  }

  if (user?.user?.email === 'omprakash16003@gmail.com') {
    navLinks.splice(2, 0, { name: 'Admin', path: '/dashboard' })
  }

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const navIcons = {
    'Home': Home,
    'All Products': ShoppingBag,
    'Why Us': HelpCircle,
    'About': Info,
    'Orders': Package,
    'Admin': LayoutDashboard
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-500 ${
      isScrolled 
        ? mode === 'dark'
          ? 'bg-gray-900/80 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-md shadow-lg'
        : mode === 'dark'
          ? 'bg-transparent'
          : 'bg-green-100/70 backdrop-blur-sm'
    }`}>
      {/* Announcement Bar */}
      <div className={`relative overflow-hidden transition-all duration-300 ${
        mode === 'dark' 
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-r from-green-600 via-green-500 to-green-600'
      }`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <p className="relative py-2 text-center text-sm font-medium text-white">
          🌿 Fresh Vegetables Harvested & Delivered Today! 🚚
        </p>
      </div>

      {/* Mobile Menu */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className={`relative flex w-[280px] max-w-[90vw] flex-col ${
                mode === 'dark' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-900'
              }`}>
                {/* Menu Header */}
                <div className={`flex items-center justify-between p-4 border-b ${
                  mode === 'dark' ? 'border-gray-800' : 'border-gray-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-green-600 to-green-400 opacity-20 blur"></div>
                      <h2 className="relative text-xl font-bold text-green-600">
                        NaveDhana
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`rounded-full p-2 hover:bg-opacity-10 transition-colors duration-200 ${
                      mode === 'dark' 
                        ? 'hover:bg-white' 
                        : 'hover:bg-gray-900'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Menu Content */}
                <div className="flex-1 overflow-y-auto py-6">
                  {/* Navigation Links */}
                  <nav className="space-y-2 px-4">
                    {navLinks.map((link) => {
                      const Icon = navIcons[link.name];
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                            location.pathname === link.path
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                              : `hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                  mode === 'dark' 
                                    ? 'text-gray-300 hover:text-white' 
                                    : 'text-gray-700 hover:text-gray-900'
                                }`
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{link.name}</span>
                          {location.pathname === link.path && (
                            <span className="ml-auto">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* User Actions */}
                  <div className={`mt-6 border-t px-4 pt-6 ${
                    mode === 'dark' ? 'border-gray-800' : 'border-gray-100'
                  }`}>
                    <div className="flex flex-col space-y-4">
                      {/* Theme Toggle */}
                      <button
                        onClick={() => {
                          toggleMode();
                          setOpen(false);
                        }}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 ${
                          mode === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>Theme</span>
                        <span>{mode === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</span>
                      </button>

                      {/* Cart Link */}
                      <Link
                        to="/cart"
                        className={`flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 ${
                          mode === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        <span>Cart</span>
                        <span className="flex items-center">
                          <ShoppingCart className="h-5 w-5" />
                          {cartItems.length > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                              {cartItems.length}
                            </span>
                          )}
                        </span>
                      </Link>

                      {/* Auth Button */}
                      {user ? (
                        <button
                          onClick={() => {
                            logout();
                            setOpen(false);
                          }}
                          className={`flex items-center justify-center rounded-lg px-4 py-3 transition-all duration-200 ${
                            mode === 'dark'
                              ? 'bg-gray-800 hover:bg-gray-700 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          Logout
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            openAuthModal('login');
                            setOpen(false);
                          }}
                          className={`flex items-center justify-center rounded-lg px-4 py-3 transition-all duration-200 ${
                            mode === 'dark'
                              ? 'bg-gray-800 hover:bg-gray-700 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          Login
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Navigation */}
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <button
            type="button"
            className={`group relative rounded-full p-2 lg:hidden focus:outline-none ${
              mode === 'dark' 
                ? 'text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:bg-gray-100'
            } transition-all duration-200`}
            onClick={() => setOpen(true)}
          >
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-green-600 to-green-400 opacity-0 blur transition-opacity duration-200 group-hover:opacity-20"></div>
            <div className="relative flex items-center justify-center w-6 h-6">
              <Menu className="h-6 w-6 transform transition-transform duration-200 group-hover:scale-110" />
            </div>
          </button>

          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center flex-shrink-0 transition-transform duration-200 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-green-600 to-green-400 opacity-20 blur group-hover:opacity-30 transition-opacity duration-200"></div>
              <h1 className={`relative text-2xl font-bold ${
                mode === 'dark' 
                  ? 'text-white' 
                  : 'text-green-700'
              }`}>
                NaveDhana
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-all duration-200 group ${
                  location.pathname === link.path
                    ? 'text-green-600'
                    : mode === 'dark'
                    ? 'text-white hover:text-green-400'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full ${
                  location.pathname === link.path ? 'w-full' : ''
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleMode}
              className={`relative p-2 rounded-full transition-all duration-200 group ${
                mode === 'dark' 
                  ? 'text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur"></div>
              {mode === 'light' ? (
                <Sun className="relative h-5 w-5" />
              ) : (
                <Moon className="relative h-5 w-5" />
              )}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2 rounded-full transition-all duration-200 group ${
                mode === 'dark' 
                  ? 'text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-600 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur"></div>
              <ShoppingCart className="relative h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-green-600 to-green-400 text-white text-xs flex items-center justify-center shadow-lg transform transition-transform duration-200 group-hover:scale-110">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Login/Logout */}
            {user ? (
              <button
                onClick={logout}
                className={`text-sm font-medium transition-all duration-200 ${
                  mode === 'dark' 
                    ? 'text-white hover:text-green-400' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className={`text-sm font-medium transition-all duration-200 ${
                  mode === 'dark' 
                    ? 'text-white hover:text-green-400' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        closeModal={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  )
}
