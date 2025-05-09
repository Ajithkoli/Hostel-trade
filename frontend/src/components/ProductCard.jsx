import { Link } from "react-router-dom";
import { addToCart } from "../utils/cart"; // 👈 import cart utility

export default function ProductCard({ product }) {
  const handleAddToCart = () => {
    addToCart(product);
    alert("Product added to cart!");
  };

  return (
    <div className="card w-80 h-[460px] bg-base-100 shadow-md hover:shadow-xl transition-shadow">
      <figure className="h-48 w-full">
        <img
          src={
            product.images && product.images.length > 0
              ? `${import.meta.env.VITE_SERVER_URL}/${product.images[0]}`
              : "/placeholder.jpg"
          }
          alt={product.name}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </figure>
      <div className="card-body flex flex-col justify-between">
        <div>
          <h2 className="card-title text-lg">{product.name}</h2>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>
        <span className=" badge badge-accent">{product.intent}</span>
        <div className="mt-auto">
          <div className="flex justify-between items-center mt-4">
            <span className="text-xl font-bold">₹{product.price}</span>
            <button
              onClick={handleAddToCart}
              className="btn btn-sm btn-primary"
            >
              Add to Cart
            </button>
          </div>
          <div className="card-actions mt-4">
            <Link
              to={`/products/${product._id}`}
              className="btn btn-outline btn-sm w-full"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
