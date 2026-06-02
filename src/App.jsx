import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import { AdminProvider } from "./admin/context/AdminContext";

// Admin
import AdminLayout from "./admin/components/AdminLayout";
import StoreAdminLayout from "./admin/components/StoreAdminLayout";
import AdminRoute from "./admin/components/AdminRoute";
import StoreAdminRoute from "./admin/components/StoreAdminRoute";
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import StoreAdminDashboard from "./admin/pages/StoreAdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminAnalytics from "./admin/pages/AdminAnalytics";
import AdminContent from "./admin/pages/AdminContent";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminPrivacy from "./admin/pages/AdminPrivacy";
import AdminTerms from "./admin/pages/AdminTerms";
import AdminManagement from "./admin/pages/AdminManagement";
import { StoreAdminProducts, StoreAdminOrders, StoreAdminCustomers, StoreAdminAnalytics, StoreAdminSettings } from "./admin/pages/StoreAdminPages";

// Store
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
            {/* Public store routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />

            {/* Unified auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Legacy admin login → unified login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Super Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
              <Route path="users" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
              <Route path="customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
              <Route path="analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path="content" element={<AdminRoute><AdminContent /></AdminRoute>} />
              <Route path="settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              <Route path="privacy" element={<AdminRoute superOnly><AdminPrivacy /></AdminRoute>} />
              <Route path="terms" element={<AdminRoute superOnly><AdminTerms /></AdminRoute>} />
              <Route path="admins" element={<AdminRoute superOnly><AdminManagement /></AdminRoute>} />
            </Route>

            {/* Store Admin routes */}
            <Route path="/store-admin" element={<StoreAdminLayout />}>
              <Route index element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
              <Route path="dashboard" element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
              <Route path="products" element={<StoreAdminRoute><StoreAdminProducts /></StoreAdminRoute>} />
              <Route path="orders" element={<StoreAdminRoute><StoreAdminOrders /></StoreAdminRoute>} />
              <Route path="customers" element={<StoreAdminRoute><StoreAdminCustomers /></StoreAdminRoute>} />
              <Route path="analytics" element={<StoreAdminRoute><StoreAdminAnalytics /></StoreAdminRoute>} />
              <Route path="settings" element={<StoreAdminRoute><StoreAdminSettings /></StoreAdminRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AdminProvider>
    </StoreProvider>
  );
}
