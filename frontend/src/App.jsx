import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import MyProducts from "./pages/MyProducts";
import ChatPage from "./pages/ChatPage";
import ChatListPage from "./pages/hatListPage";
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
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
        <Route path="/inbox" element={<PrivateRoute><ChatListPage /></PrivateRoute>} />
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
