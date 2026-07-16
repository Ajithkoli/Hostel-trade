import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../store/authSlice";
import { addToCart } from "../utils/cart";
import { getImageUrl } from "../utils/image";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../utils/api";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [productStatus, setProductStatus] = useState(product.status || "Available");

  const sellerId = product.user?._id || product.user;
  const isOwner = user && user._id === sellerId;
  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success("Product added to cart!");
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      return toast.warning("Please log in to add items to your wishlist");
    }
    try {
      await dispatch(toggleWishlist(product._id)).unwrap();
    } catch (err) {
      toast.error("Failed to toggle wishlist");
    }
  };

  const handleToggleStatus = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = productStatus === "Available" ? "Sold" : "Available";
    try {
      await api.patch(`/api/products/${product._id}/status`, { status: nextStatus });
      setProductStatus(nextStatus);
      toast.success(`Product marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleRenewListing = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/api/products/${product._id}/renew`, {});
      toast.success("Listing renewed (bumped to top)!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to renew listing");
    }
  };

  return (
    <div className="card w-full max-w-[320px] mx-auto h-[480px] bg-base-100 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden">
      {/* Product Image and Indicators */}
      <figure className="h-48 w-full relative">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-error rounded-full shadow-md transition-all cursor-pointer z-10"
        >
          {isWishlisted ? (
            <FaHeart className="w-4 h-4" />
          ) : (
            <FaRegHeart className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Sold Badge Overlay */}
        {productStatus === "Sold" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-extrabold text-xl tracking-wider select-none z-10">
            SOLD
          </div>
        )}
      </figure>

      {/* Card Content details */}
      <div className="card-body flex flex-col justify-between p-5">
        <div>
          <h2 className="card-title text-base font-bold line-clamp-1">{product.name}</h2>
          <p className="text-xs text-gray-500 mb-2">
            Hostel: {product.user?.hostel || "Not Specified"}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 h-10">
            {product.description}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <span className="badge badge-accent font-semibold text-xs">{product.intent}</span>
          {productStatus === "Sold" && (
            <span className="badge badge-error text-white font-semibold text-xs">Sold</span>
          )}
        </div>

        <div className="divider my-1"></div>

        {/* Dynamic footer based on ownership */}
        <div className="mt-auto">
          {isOwner ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleToggleStatus}
                  className={`btn btn-xs flex-1 text-white ${
                    productStatus === "Available" ? "btn-error" : "btn-success"
                  }`}
                >
                  {productStatus === "Available" ? "Mark Sold" : "Mark Available"}
                </button>
                <button
                  onClick={handleRenewListing}
                  className="btn btn-xs btn-outline btn-primary flex-1"
                >
                  Renew
                </button>
              </div>
              <Link
                to={`/products/${product._id}`}
                className="btn btn-outline btn-sm w-full"
              >
                View Details
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold">₹{product.price}</span>
                <button
                  onClick={handleAddToCart}
                  disabled={productStatus === "Sold"}
                  className="btn btn-sm btn-primary"
                >
                  Add to Cart
                </button>
              </div>
              <div className="card-actions mt-3">
                <Link
                  to={`/products/${product._id}`}
                  className="btn btn-outline btn-sm w-full"
                >
                  View Details
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
