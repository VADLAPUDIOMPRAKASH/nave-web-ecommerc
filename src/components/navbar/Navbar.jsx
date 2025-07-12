import { Fragment, useContext, useState, useEffect } from 'react'
import { Dialog, Transition, Menu } from '@headlessui/react'
import { Link, useLocation } from '@tanstack/react-router'
import { Menu as MenuIcon, ShoppingCart, X, Home, ShoppingBag, HelpCircle, Info, Package, LayoutDashboard, User, LogOut, Settings } from 'lucide-react'
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
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userChanged'))
    window.location.href = "/"
  }

  const context = useContext(myContext)

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
    navLinks.splice(2, 0, { name: 'My Orders', path: '/order' })
  }

  // Check if user has dashboard access (admin or delivery boy)
  const userRole = localStorage.getItem('userRole');
  if (user?.user?.email === 'omprakash16003@gmail.com' || 
      userRole === 'master_admin' || 
      userRole === 'sub_admin' || 
      userRole === 'delivery_boy') {
    const dashboardLabel = userRole === 'delivery_boy' ? 'Delivery' : 'Admin';
    navLinks.splice(-1, 0, { name: dashboardLabel, path: '/dashboard' })
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
    'My Orders': Package,
    'Admin': LayoutDashboard
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-500 w-full max-w-screen` +
      (isScrolled ? ' bg-white/80 backdrop-blur-md shadow-lg' : ' bg-green-100/70 backdrop-blur-sm')
    }>
      {/* Announcement Bar */}
      <div className={`relative overflow-hidden transition-all duration-300 w-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 ${
        isScrolled ? 'max-h-0 opacity-0 md:max-h-none md:opacity-100' : 'max-h-8 md:max-h-12 opacity-100'
      }`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <p className="relative w-full text-center font-medium text-white px-2 py-0.5 md:py-1 lg:py-2 text-xs md:text-sm lg:text-base whitespace-normal break-words overflow-x-auto">
          🌿 Fresh Vegetables Harvested Today & Delivered Today! 
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
              <Dialog.Panel className={`relative flex w-[320px] max-w-[95vw] flex-col bg-gradient-to-br from-green-50 via-white to-green-100 shadow-2xl border-l border-green-100 overflow-hidden`}>
                {/* Decorative SVG Curve */}
                <div className="absolute top-0 left-0 w-full" style={{ zIndex: 2 }}>
                  <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20">
                    <path d="M0,80 Q80,0 320,40 L320,0 L0,0 Z" fill="#bbf7d0" />
                  </svg>
                </div>
                {/* User Profile Section - floating card */}
                <div className="relative z-10 flex items-center gap-3 p-5 mx-5 mb-2 bg-white/90 rounded-3xl shadow-xl border border-green-200 mt-14" style={{ boxShadow: '0 8px 32px rgba(34,197,94,0.10)' }}>
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center text-green-700 font-bold text-2xl shadow-md">
                    {user?.user?.displayName ? user.user.displayName[0] : user?.user?.email ? user.user.email[0].toUpperCase() : <User className="w-7 h-7" />}
                  </div>
                  <div className="flex flex-col">
                    {user ? (
                      <>
                        <span className="font-semibold text-green-800 text-lg truncate max-w-[140px]">{user.user?.displayName || user.user?.email}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[140px]">{user.user?.email}</span>
                      </>
                    ) : (
                      <button
                        onClick={() => { openAuthModal('login'); setOpen(false); }}
                        className="text-green-700 font-semibold text-sm px-4 py-1 rounded-lg border border-green-200 hover:bg-green-50 transition"
                      >
                        Login / Signup
                      </button>
                    )}
                  </div>
                </div>
                <div className="my-4" />
                {/* Menu Header - more whitespace, layered look */}
                <div className="flex items-center justify-between p-5 pb-2 bg-transparent">
                  <div className="flex items-center gap-2">
                    <h2 className="relative text-2xl font-extrabold text-green-600 tracking-wide drop-shadow-sm">
                        NaveDhana
                      </h2>
                  </div>
                  <button
                    type="button"
                    className={`rounded-full p-2 hover:bg-green-100 transition-colors duration-200 shadow`}
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                {/* Menu Content - more space, card effect */}
                <div className="flex-1 overflow-y-auto py-8 px-2 bg-transparent">
                  {/* Navigation Links */}
                  <nav className="space-y-4 px-2">
                    {navLinks.map((link) => {
                      const Icon = navIcons[link.name] || Home;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center space-x-3 rounded-2xl px-5 py-4 transition-all duration-200 shadow border border-green-100 bg-white hover:bg-green-50 text-green-800 font-semibold text-base ${location.pathname === link.path ? 'ring-2 ring-green-400' : ''}`}
                          onClick={() => setOpen(false)}
                          style={{ boxShadow: '0 2px 12px rgba(34,197,94,0.06)' }}
                        >
                          <Icon className="h-6 w-6" />
                          <span>{link.name}</span>
                          {location.pathname === link.path && (
                            <span className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-green-600"></div>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  {/* Divider */}
                  <div className="my-8 border-t border-green-100"></div>
                  {/* User Actions - card style */}
                  <div className="flex flex-col space-y-4 px-2">
                      {/* Cart Link */}
                      <Link
                        to="/cart"
                      className={`flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 shadow border border-green-100 bg-white hover:bg-green-50 text-green-800 font-semibold text-base`}
                        onClick={() => setOpen(false)}
                      style={{ boxShadow: '0 2px 12px rgba(34,197,94,0.06)' }}
                      >
                        <span>Cart</span>
                        <span className="flex items-center">
                        <ShoppingCart className="h-6 w-6" />
                          {cartItems.length > 0 && (
                          <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                              {cartItems.length}
                            </span>
                          )}
                        </span>
                      </Link>
                      {/* Auth Button */}
                      {user ? (
                        <button
                        onClick={() => { logout(); setOpen(false); }}
                        className={`flex items-center justify-center rounded-2xl px-5 py-4 transition-all duration-200 shadow border border-green-100 bg-white hover:bg-green-50 text-green-800 font-semibold text-base`}
                        style={{ boxShadow: '0 2px 12px rgba(34,197,94,0.06)' }}
                        >
                          Logout
                        </button>
                      ) : (
                        <>
                          
                        </>
                      )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Navigation */}
      <nav className="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="flex h-10 md:h-16 items-center justify-between w-full">
          {/* Mobile menu button */}
          <button
            type="button"
            className={`group relative rounded-full p-1.5 md:p-2 lg:hidden focus:outline-none`}
            onClick={() => setOpen(true)}
          >
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-green-600 to-green-400 opacity-0 blur transition-opacity duration-200 group-hover:opacity-20"></div>
            <div className="relative flex items-center justify-center w-4 h-4 md:w-6 md:h-6">
              <MenuIcon className="h-4 w-4 md:h-6 md:w-6 transform transition-transform duration-200 group-hover:scale-110" />
            </div>
          </button>

          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center flex-shrink-0 transition-transform duration-200 hover:scale-105 min-w-0 max-w-full truncate"
          >
            <div className="relative min-w-0 max-w-full truncate">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-green-600 to-green-400 opacity-20 blur group-hover:opacity-30 transition-opacity duration-200"></div>
              <h1 className={`relative text-lg md:text-2xl font-bold min-w-0 max-w-full truncate`}>
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
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 max-w-full">
            {/* Cart - Hidden on mobile */}
            <Link
              to="/cart"
              className={`relative p-1.5 md:p-2 rounded-full transition-all duration-200 group hidden sm:block`}
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-600 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur"></div>
              <ShoppingCart className="relative h-4 w-4 md:h-5 md:w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-gradient-to-r from-green-600 to-green-400 text-white text-xs flex items-center justify-center shadow-lg transform transition-transform duration-200 group-hover:scale-110">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown or Login Button */}
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className={`relative p-1.5 md:p-2 rounded-full transition-all duration-200 group`}>
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-600 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur"></div>
                  <User className="relative h-4 w-4 md:h-5 md:w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className={`absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-green-100 focus:outline-none border border-green-50 backdrop-blur-sm overflow-hidden`}>
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active 
                                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800'
                                : 'text-gray-700 hover:text-green-700 hover:bg-green-100'
                            } group flex w-full items-center px-3 py-2 text-sm transition-all duration-200 rounded-lg font-medium`}
                          >
                            <User className={`mr-3 h-4 w-4 ${active ? 'text-green-600' : 'text-gray-500'}`} />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <div className="border-t border-green-50 my-1 mx-1"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active 
                                ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800'
                                : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                            } group flex w-full items-center px-3 py-2 text-sm transition-all duration-200 rounded-lg font-medium`}
                          >
                            <LogOut className={`mr-3 h-4 w-4 ${active ? 'text-red-600' : 'text-gray-500'}`} />
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className={`relative inline-flex items-center min-w-0 max-w-full px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 group overflow-hidden truncate text-ellipsis whitespace-nowrap text-sm`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                <span className="relative flex items-center min-w-0 max-w-full truncate">
                  <User className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 min-w-0 max-w-full" />
                  Login
                </span>
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
