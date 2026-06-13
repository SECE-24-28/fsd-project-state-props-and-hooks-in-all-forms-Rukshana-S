import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import { AdminProvider } from "./admin/context/AdminContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import ErrorBoundary from "./Components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Components/Loading";
import ScrollToTop from "./Components/ScrollToTop";
import BackToTop from "./Components/BackToTop";


// ── Admin layout & guards
import AdminLayout from "./admin/components/AdminLayout";
import StoreAdminLayout from "./admin/components/StoreAdminLayout";
import AdminRoute from "./admin/components/AdminRoute";
import StoreAdminRoute from "./admin/components/StoreAdminRoute";

// ── Admin pages
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
import AdminMessages from "./admin/pages/AdminMessages";
import StoreApplications from "./admin/pages/StoreApplications";
import ActivityLogs from "./admin/pages/ActivityLogs";
import Trash from "./admin/pages/Trash";
import {
  StoreAdminProducts, StoreAdminOrders, StoreAdminCustomers,
  StoreAdminAnalytics, StoreAdminSettings,
} from "./admin/pages/StoreAdminPages";

// ── Standalone store-admin pages
import PendingSellerPage from "./Pages/storeadmin/PendingSellerPage";
import RejectedPage from "./Pages/storeadmin/RejectedPage";

// ── Public store pages
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import FloatingSpinWidget from "./Components/FloatingSpinWidget";

// Code splitting / Lazy loading store pages
const Homepage = React.lazy(() => import("./Pages/Homepage"));
const Products = React.lazy(() => import("./Pages/Products"));
const ProductDetails = React.lazy(() => import("./Pages/ProductDetails"));
const About = React.lazy(() => import("./Pages/About"));
const Contact = React.lazy(() => import("./Pages/Contact"));
const Cart = React.lazy(() => import("./Pages/Cart"));
const Wishlist = React.lazy(() => import("./Pages/Wishlist"));
const Login = React.lazy(() => import("./Pages/Login"));
const Register = React.lazy(() => import("./Pages/Register"));
const ForgotPassword = React.lazy(() => import("./Pages/ForgotPassword"));
const MyMessages = React.lazy(() => import("./Pages/MyMessages"));
const FAQPage = React.lazy(() => import("./Pages/FAQPage"));
const PrivacyPolicy = React.lazy(() => import("./Pages/PrivacyPolicy"));
const TermsConditions = React.lazy(() => import("./Pages/TermsConditions"));
const Checkout = React.lazy(() => import("./Pages/Checkout"));
const OrderSuccess = React.lazy(() => import("./Pages/OrderSuccess"));
const NotFound = React.lazy(() => import("./Pages/NotFound"));
const Brands = React.lazy(() => import("./Pages/Brands"));
const MyOrders = React.lazy(() => import("./Pages/MyOrders"));
const OrderTracking = React.lazy(() => import("./Pages/OrderTracking"));
const SpinWheel = React.lazy(() => import("./Pages/SpinWheel"));
const Profile = React.lazy(() => import("./Pages/Profile"));
const Receipt = React.lazy(() => import("./Pages/Receipt"));

const NO_CHROME = ["/login", "/register", "/forgot-password", "/reset-password"];

function StoreLayout() {
  const { pathname } = useLocation();
  const hide = NO_CHROME.includes(pathname);
  return (
    <>
      {!hide && <Navbar />}
      <React.Suspense fallback={<Loading type="spinner" />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/my-messages" element={<ProtectedRoute><MyMessages /></ProtectedRoute>} />
          <Route path="/spin-wheel" element={<ProtectedRoute><SpinWheel /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/receipt/:id" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
      {!hide && <FloatingSpinWidget />}
      {!hide && <BackToTop />}
      {!hide && <Footer />}
    </>
  );
}

// AppRoutes is inside BrowserRouter so AuthProvider can use useNavigate
function AppRoutes() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Routes>
          {/* ── Standalone pages ── */}
          <Route path="/store-admin/pending" element={<PendingSellerPage />} />
          <Route path="/store-admin/rejected" element={<RejectedPage />} />

          {/* ── Admin login redirect ── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Super Admin routes ── */}
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
            <Route path="messages" element={<AdminRoute superOnly><AdminMessages /></AdminRoute>} />
            <Route path="store-applications" element={<AdminRoute superOnly><StoreApplications /></AdminRoute>} />
            <Route path="activity" element={<AdminRoute superOnly><ActivityLogs /></AdminRoute>} />
            <Route path="trash" element={<AdminRoute superOnly><Trash /></AdminRoute>} />
          </Route>

          {/* ── Store Admin routes ── */}
          <Route path="/store-admin" element={<StoreAdminLayout />}>
            <Route index element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
            <Route path="dashboard" element={<StoreAdminRoute><StoreAdminDashboard /></StoreAdminRoute>} />
            <Route path="products" element={<StoreAdminRoute><StoreAdminProducts /></StoreAdminRoute>} />
            <Route path="orders" element={<StoreAdminRoute><StoreAdminOrders /></StoreAdminRoute>} />
            <Route path="customers" element={<StoreAdminRoute><StoreAdminCustomers /></StoreAdminRoute>} />
            <Route path="analytics" element={<StoreAdminRoute><StoreAdminAnalytics /></StoreAdminRoute>} />
            <Route path="settings" element={<StoreAdminRoute><StoreAdminSettings /></StoreAdminRoute>} />
          </Route>

          {/* ── All public store routes ── */}
          <Route path="/*" element={<StoreLayout />} />
        </Routes>
      </AdminProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <StoreProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </StoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
