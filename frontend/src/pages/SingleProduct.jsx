import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { addToCart } from "../utils/cart";
import { useSelector } from "react-redux";

export default function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Get logged-in user from Redux
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  const imageUrls =
    product.images?.map(
      (img) => `${import.meta.env.VITE_SERVER_URL}/${img}`
    ) || [];

  const isSeller = user && product.user && (user._id === product.user._id);

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <div className="container mx-auto px-4">
        <div className="card bg-base-100 shadow-xl flex flex-col lg:flex-row">
          {/* IMAGE SLIDER */}
          <div className="lg:w-1/2">
            <div className="carousel w-full rounded-lg">
              {imageUrls.length > 0 ? (
                imageUrls.map((img, index) => (
                  <div
                    key={index}
                    id={`item${index}`}
                    className="carousel-item w-full"
                  >
                    <img
                      src={img}
                      className="w-full h-[400px] object-cover cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                      alt={`Product ${index}`}
                    />
                  </div>
                ))
              ) : (
                <img
                  src="/placeholder.jpg"
                  className="w-full h-[400px] object-cover rounded-lg"
                  alt="Placeholder"
                />
              )}
            </div>
            <div className="flex justify-center mt-2 gap-2">
              {imageUrls.map((_, index) => (
                <a
                  key={index}
                  href={`#item${index}`}
                  className="btn btn-xs btn-outline"
                >
                  {index + 1}
                </a>
              ))}
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="card-body lg:w-1/2">
            <h2 className="card-title text-3xl font-bold">{product.name}</h2>
            <p className="mt-2 text-lg text-gray-700">{product.description}</p>
            <div className="mt-4">
              <span className="text-2xl font-bold">₹{product.price}</span>
              <span className="ml-4 badge badge-outline">
                {product.category}
              </span>
              <span className="ml-4 badge badge-accent">{product.intent}</span>
            </div>
            <p className="mt-4">
              <strong>Stock:</strong> {product.stock}
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  addToCart(product);
                  alert("Product added to cart!");
                }}
              >
                Add to Cart
              </button>
              {isSeller ? (
 <Link to="/inbox" className="btn btn-outline btn-info relative">
 Messages
 <span className="absolute top-0 right-0">
   <span className="relative inline-flex h-3 w-3">
     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
     <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
   </span>
 </span>
</Link>


) : (
  <Link
    to={`/chat?receiver=${product.user?._id}`}
    className="btn btn-secondary"
  >
    Chat with Seller
  </Link>
)}

            </div>
            <div className="divider"></div>
            <div>
              <h3 className="text-xl font-semibold">Seller Details:</h3>
              <p>
                <strong>Name:</strong> {product.user?.name}
              </p>
              <p>
                <strong>Email:</strong> {product.user?.email}
              </p>
              <p>
                <strong>Seller ID:</strong> {product.user?._id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <dialog
          id="imageModal"
          className="modal modal-open"
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-box max-w-4xl p-2 bg-base-100">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-auto rounded-lg"
            />
            <div className="modal-action">
              <form method="dialog">
                <button className="btn" onClick={() => setSelectedImage(null)}>
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
