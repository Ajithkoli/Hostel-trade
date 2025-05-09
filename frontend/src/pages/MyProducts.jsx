// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const { data } = await axios.get("/api/products/myproducts", {
          withCredentials: true,
        });
        setProducts(data);
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to load your products";
        setError(errMsg);
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">My Products</h1>
          <Link to="/addProduct" className="btn btn-primary">
            Add Product
          </Link>
        </div>

        {error && (
          <div className="alert alert-error shadow-lg mb-6">
            <span>{error}</span>
          </div>
        )}

        {products.length === 0 ? (
          <div className="card shadow-md bg-base-100 text-center p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
            <p className="text-base-content mb-4">
              You haven’t added any products yet.
            </p>
            <Link to="/addProduct" className="btn btn-primary">
              Add Your First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={() => {}}
                />
              ))}
            </div>
            <div className="flex justify-end mt-10">
              <Link to="/addProduct" className="btn btn-outline btn-primary">
                Add Another Product
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
