import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { HiOutlineShoppingCart, HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".mobile-menu") &&
        !e.target.closest(".menu-button")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="bg-surface shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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
              {user && (
                <>
                  <Link
                    to="/my-products"
                    className="nav-link inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    My Products
                  </Link>
                  <Link
                    to="/dashboard"
                    className="nav-link inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <Link
                  to="/addProduct"
                  className="btn btn-accent mr-4 hidden sm:inline-flex"
                >
                  Add Product
                </Link>
                <Link to="/cart" className="btn btn-ghost btn-circle mr-2">
                  <div className="indicator">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {items.length > 0 && (
                      <span className="badge badge-primary badge-sm indicator-item">
                        {items.length}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="relative ml-3">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex rounded-full bg-gray-100 text-sm focus:outline-none"
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user?.avatar || "https://via.placeholder.com/40"}
                      alt="User avatar"
                    />
                  </button>
                  {isOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-surface py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      <Link
                        to="/profile"
                        className="nav-link block px-4 py-2 text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/my-products"
                        className="nav-link block px-4 py-2 text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        My Products
                      </Link>
                      <Link
                        to="/dashboard"
                        className="nav-link block px-4 py-2 text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="nav-link block w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-800"
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
                  className="btn btn-secondary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
        >
          <span className="sr-only">Open main menu</span>
          {/* Icon for menu */}
          <svg
            className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {/* Icon for close */}
          <svg
            className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden bg-surface border-t`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/marketplace"
            className="nav-link block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Marketplace
          </Link>
          {user && (
            <>
              <Link
                to="/my-products"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                My Products
              </Link>
              <Link
                to="/dashboard"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/cart"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Cart
              </Link>
              <Link
                to="/addProduct"
                className="nav-link block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
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
