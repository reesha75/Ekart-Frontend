import { ShoppingCart, Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/redux/userSlice'
import { setCart } from '@/redux/productSlice'
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user } = useSelector(store => store.user)
  const { cart } = useSelector(store => store.product)
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const admin = user?.role === "admin" ? true : false

  // Handle scroll to change background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Sync cart on mount and whenever user logs in or out
  useEffect(() => {
    const fetchCartData = async () => {
      const token = localStorage.getItem('accessToken');
      if (user && token) {
        try {
          const res = await api.get('/api/v1/cart', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.data.success) {
            dispatch(setCart(res.data.cart));
          }
        } catch (error) {
          console.error("Navbar - Failed to fetch cart:", error);
        }
      }
    };
    fetchCartData();
  }, [user, dispatch]);

  const logoutHandler = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      if (token) {
        await api.post('/api/v1/user/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("API Logout Error:", error);
    } finally {
      // Always clear user session in frontend regardless of server status or expired token
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      dispatch(setUser(null))
      dispatch(setCart({ items: [], totalPrice: 0 })) // Clear Redux cart state on logout
      toast.success("Logged out successfully");
      navigate("/login")
    }
  }

  const isLinkActive = (path) => {
    return location.pathname === path
  }

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/5 ${
        scrolled 
          ? 'bg-background/90 backdrop-blur-md shadow-lg shadow-black/30 py-3' 
          : 'bg-background/40 backdrop-blur-sm py-4'
      }`}
    >
      <div className='max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6'>

        {/* Logo */}
        <Link to='/' className='flex items-center gap-3 group'>
          <div className="relative">
            <img
              src={logo}
              alt='Ekart'
              className='w-[50px] h-[50px] object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]'
            />
          </div>
          <h1 className='text-2xl font-bold tracking-wider font-heading gradient-text'>
            EKART
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center gap-8'>
          <ul className='flex gap-8 items-center text-sm font-medium tracking-wide'>
            <li>
              <Link
                to='/'
                className={`relative py-1 transition-colors duration-200 hover:text-accent group ${
                  isLinkActive('/') ? 'text-accent' : 'text-white/80'
                }`}
              >
                Home
                <span className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-300 ${
                  isLinkActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            </li>

            <li>
              <Link
                to='/products'
                className={`relative py-1 transition-colors duration-200 hover:text-accent group ${
                  isLinkActive('/products') ? 'text-accent' : 'text-white/80'
                }`}
              >
                Products
                <span className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-300 ${
                  isLinkActive('/products') ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            </li>

            {user && (
              <li>
                <Link
                  to={`/profile/${user._id}`}
                  className={`flex items-center gap-1.5 py-1 transition-colors duration-200 hover:text-accent group ${
                    location.pathname.startsWith('/profile') ? 'text-accent' : 'text-white/80'
                  }`}
                >
                  <User className="size-4" />
                  <span>Hello, <b className="font-semibold text-white">{user.firstName}</b></span>
                </Link>
              </li>
            )}

            {admin && (
              <li>
                <Link
                  to={`/dashboard/sales`}
                  className={`flex items-center gap-1.5 py-1 transition-colors duration-200 hover:text-accent group ${
                    location.pathname.startsWith('/dashboard') ? 'text-accent' : 'text-white/80'
                  }`}
                >
                  <LayoutDashboard className="size-4 text-secondary" />
                  <span className="font-semibold text-white">Dashboard</span>
                </Link>
              </li>
            )}
          </ul>

          <div className='flex items-center gap-6 border-l border-white/10 pl-6'>
            {/* Cart Icon */}
            <Link
              to='/cart'
              className='relative text-white/80 hover:text-accent hover:scale-105 transition-all duration-200'
            >
              <ShoppingCart className="size-6 filter drop-shadow-[0_0_3px_rgba(0,229,255,0.2)]" />
              {cartItemsCount > 0 && (
                <span className='absolute -top-2.5 -right-3.5 bg-accent text-background rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md shadow-accent/20 animate-pulse'>
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Auth Buttons */}
            {user ? (
              <Button
                onClick={logoutHandler}
                variant="outline"
                className='border-white/20 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-white rounded-full px-5 h-9 transition-all duration-200 flex items-center gap-1.5 cursor-pointer'
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            ) : (
              <Link to='/login'>
                <Button className='bg-accent hover:bg-accent-hover text-background font-semibold rounded-full px-6 h-9 transition-all duration-200 glow-accent cursor-pointer'>
                  Login
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Controls (Menu Toggle & Cart) */}
        <div className='flex items-center gap-4 md:hidden'>
          {/* Cart Icon Mobile */}
          <Link
            to='/cart'
            className='relative text-white/80 hover:text-accent p-1'
          >
            <ShoppingCart className="size-6" />
            {cartItemsCount > 0 && (
              <span className='absolute -top-1.5 -right-2 bg-accent text-background rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md'>
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Hamburger Menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-white/80 hover:text-accent focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      <div 
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-card/95 backdrop-blur-xl border-l border-white/10 shadow-2xl p-6 transition-all duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold font-heading gradient-text">Menu</h2>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/80 hover:text-accent p-1"
          >
            <X className="size-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-6">
          <ul className="flex flex-col gap-4 text-base font-medium">
            <li>
              <Link
                to='/'
                className={`block py-2 border-b border-white/5 transition-colors ${
                  isLinkActive('/') ? 'text-accent' : 'text-white/80'
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to='/products'
                className={`block py-2 border-b border-white/5 transition-colors ${
                  isLinkActive('/products') ? 'text-accent' : 'text-white/80'
                }`}
              >
                Products
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to={`/profile/${user._id}`}
                  className={`block py-2 border-b border-white/5 transition-colors ${
                    location.pathname.startsWith('/profile') ? 'text-accent' : 'text-white/80'
                  }`}
                >
                  Profile ({user.firstName})
                </Link>
              </li>
            )}
            {admin && (
              <li>
                <Link
                  to={`/dashboard/sales`}
                  className={`block py-2 border-b border-white/5 transition-colors ${
                    location.pathname.startsWith('/dashboard') ? 'text-accent' : 'text-white/80'
                  }`}
                >
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/10">
            {user ? (
              <Button
                onClick={logoutHandler}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            ) : (
              <Link to='/login' className="w-full">
                <Button className="w-full bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl py-3 glow-accent">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar