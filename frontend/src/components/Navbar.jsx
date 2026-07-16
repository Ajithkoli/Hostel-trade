import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { HiOutlineShoppingCart, HiMenu, HiX, HiOutlineBell } from "react-icons/hi";
import { getImageUrl } from "../utils/image";
import api from "../utils/api";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);   // hamburger / mobile drawer
  const [isProfileOpen, setIsProfileOpen] = useState(false); // profile picture dropdown
  const [notifIsOpen, setNotifIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".mobile-menu") &&
        !e.target.closest(".menu-button") &&
        !e.target.closest(".notif-button")
      ) {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
        setNotifIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch notifications if logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/api/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const markAllRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="bg-surface shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Left Links */}
          <div className="flex">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="CampusCart Logo" className="h-14 w-14" />
              <span className="text-primary text-xl font-bold">CampusCart</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/marketplace"
                className="nav-link inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Marketplace
              </Link>
              <Link
                to="/lost-found"
                className="nav-link inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Lost & Found
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="nav-link inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/inbox"
                    className="nav-link inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Messages
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Hamburger — mobile only, always visible */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden menu-button inline-flex items-center justify-center p-2 rounded-md text-base-content hover:bg-base-200 focus:outline-none mr-1"
              aria-label="Toggle menu"
            >
              <HiMenu className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`} />
              <HiX className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`} />
            </button>

            {user ? (
              <>
                {/* Sell Button */}
                <Link
                  to="/addProduct"
                  className="btn btn-accent mr-4 hidden sm:inline-flex"
                >
                  Add Product
                </Link>

                {/* Notifications Bell */}
                <div className="relative mr-2 notif-button">
                  <button
                    onClick={() => setNotifIsOpen(!notifIsOpen)}
                    className="btn btn-ghost btn-circle"
                  >
                    <div className="indicator">
                      <HiOutlineBell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="badge badge-error badge-xs indicator-item text-white p-1">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                  {notifIsOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-base-100 py-2 shadow-lg ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 font-bold text-sm border-b flex justify-between items-center bg-base-100">
                        <span>Notifications</span>
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline font-semibold">
                          Mark all read
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`px-4 py-3 text-xs border-b last:border-none hover:bg-base-200 transition-colors ${
                              !notif.read ? "bg-base-200/50 font-semibold" : "text-gray-500"
                            }`}
                          >
                            <p className="font-semibold text-base-content">{notif.title}</p>
                            <p className="text-[11px] mt-0.5">{notif.content}</p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Cart Icon */}
                <Link to="/cart" className="btn btn-ghost btn-circle mr-2">
                  <div className="indicator">
                    <HiOutlineShoppingCart className="h-5 w-5" />
                    {items.length > 0 && (
                      <span className="badge badge-primary badge-sm indicator-item text-white">
                        {items.length}
                      </span>
                    )}
                  </div>
                </Link>

                {/* User Dropdown */}
                <div className="relative ml-3 menu-button">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex rounded-full border-2 border-primary focus:outline-none w-9 h-9 overflow-hidden"
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={getImageUrl(user?.profilePicture)}
                      alt="User avatar"
                    />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-surface py-1 shadow-lg ring-1 ring-black ring-opacity-5 bg-base-100">
                      <div className="px-4 py-2 border-b bg-base-100/50">
                        <p className="text-xs text-gray-500 font-semibold">Signed in as</p>
                        <p className="text-sm font-bold text-primary truncate">{user.name}</p>
                        {user.role === 'admin' && (
                          <div className="badge badge-accent mt-1 capitalize text-[10px] font-bold">Admin</div>
                        )}
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="nav-link block px-4 py-2 text-sm text-accent font-bold hover:bg-base-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="nav-link block px-4 py-2 text-sm hover:bg-base-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/wishlist"
                        className="nav-link block px-4 py-2 text-sm hover:bg-base-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Wishlist
                      </Link>
                      <Link
                        to="/dashboard"
                        className="nav-link block px-4 py-2 text-sm hover:bg-base-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Listings
                      </Link>
                      <Link
                        to="/inbox"
                        className="nav-link block px-4 py-2 text-sm hover:bg-base-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Messages
                      </Link>
                      <div className="divider my-0"></div>
                      <button
                        onClick={handleLogout}
                        className="nav-link block w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-base-200 font-semibold"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>


      <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden bg-base-100 border-t mobile-menu`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/marketplace"
            className="nav-link block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link
            to="/lost-found"
            className="nav-link block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Lost & Found
          </Link>
          {user && (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="nav-link block px-3 py-2 rounded-md text-base font-bold text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/dashboard"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                My Listings
              </Link>
              <Link
                to="/wishlist"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                to="/profile"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/inbox"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                to="/addProduct"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Product
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
