import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Pages import karein
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Verify from './pages/Verify';
import VerifyEmail from './pages/VerifyEmail';
import Footer from './Footer';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
// Components import karein
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
// New Pages
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Navbar />
        <Home />
        <Footer/>
      </>
    ),
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/verify',
    element: <Verify />,
  },
  {
    path: '/verify/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOtp />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/profile/:userId',
    element: <><Navbar/><Profile/></>
  },
  {
    path: '/products',
    element: <><Navbar/><Products/><Footer/></>
  },
  {
    path: '/product/:productId',
    element: <><Navbar/><ProductDetail/><Footer/></>
  },
  {
    path: '/cart',
    element: <><Navbar/><Cart/></>
  },
  {
    path: '/checkout',
    element: <><Navbar/><Checkout/></>
  },
  {
    path: '/payment-success',
    element: <><Navbar/><PaymentSuccess/></>
  },
  {
    path: '/payment-failed',
    element: <><Navbar/><PaymentFailed/></>
  },
  {
    path: '/dashboard',
    element: <><Navbar/><Dashboard/></>
  },
  {
    path: '/dashboard/sales',
    element: <><Navbar/><Dashboard/></>
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
