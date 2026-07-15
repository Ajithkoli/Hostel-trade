import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { checkAuth } from "./store/authSlice";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RegistrationPending from "./pages/RegistrationPending";

// Admin components
import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import UserManagement from "./Admin/UserManagement";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddProduct from "./pages/AddProduct";
import SingleProduct from "./pages/SingleProduct";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import WishlistPage from "./pages/WishlistPage";
import MyProducts from "./pages/MyProducts";
import LostFoundPage from "./pages/LostFoundPage";
import LostFoundDetailsPage from "./pages/LostFoundDetailsPage";
import CreateLostFoundPost from "./pages/CreateLostFoundPost";

import InboxPage from "./pages/InboxPage";
import AdminProductManagement from "./Admin/AdminProductManagement";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };

    initializeApp();
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/products/:id" element={<SingleProduct />} />
        <Route path="/addProduct" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><MyProducts /></PrivateRoute>} />

        {/* Lost & Found Routes */}
        <Route path="/lost-found" element={<LostFoundPage />} />
        <Route path="/lost-found/:id" element={<LostFoundDetailsPage />} />
        <Route path="/lost-found/create" element={<PrivateRoute><CreateLostFoundPost /></PrivateRoute>} />

        <Route path="/inbox" element={<PrivateRoute><InboxPage /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registration-pending" element={<RegistrationPending />} />

        {/* Legal and Info Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<AdminProductManagement />} />
        </Route>
      </Routes>

      {/* ✅ Moved outside <Routes> */}
      <ToastContainer position="top-right" autoClose={3000} />

    </Router>
  );
}

export default App;
