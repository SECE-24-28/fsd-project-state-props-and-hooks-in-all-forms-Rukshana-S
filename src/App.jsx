import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import { AdminProvider } from "./admin/context/AdminContext";
import AdminLayout from "./admin/components/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminRoute from "./admin/components/AdminRoute";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminAnalytics from "./admin/pages/AdminAnalytics";
import AdminContent from "./admin/pages/AdminContent";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminPrivacy from "./admin/pages/AdminPrivacy";
import AdminTerms from "./admin/pages/AdminTerms";
import AdminManagement from "./admin/pages/AdminManagement";
import Dashboard from "./admin/pages/Dashboard";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Homepage from "./Pages/Homepage";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetails";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import FAQPage from "./Pages/FAQPage";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsConditions from "./Pages/TermsConditions";
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";

export default function App() {
  return (
    <StoreProvider>
      <AdminProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}> 
            <Route index element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
            <Route path="analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="content" element={<AdminRoute><AdminContent /></AdminRoute>} />
            <Route path="settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="privacy" element={<AdminRoute superOnly={true}><AdminPrivacy /></AdminRoute>} />
            <Route path="terms" element={<AdminRoute superOnly={true}><AdminTerms /></AdminRoute>} />
            <Route path="admins" element={<AdminRoute superOnly={true}><AdminManagement /></AdminRoute>} />
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
      </AdminProvider>
    </StoreProvider>
  );
}
