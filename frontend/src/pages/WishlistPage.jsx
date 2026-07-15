import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get("/api/auth/wishlist", {
          withCredentials: true,
        });
        setItems(data);
      } catch (error) {
        toast.error("Failed to load wishlist items");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-primary mb-8">My Saved Listings</h1>

        {items.length === 0 ? (
          <div className="card bg-base-100 shadow-md p-12 text-center max-w-xl mx-auto my-10">
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-base-content/70 mb-6">
              Save products you are interested in to keep track of them easily.
            </p>
            <Link to="/marketplace" className="btn btn-primary btn-sm mx-auto">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
