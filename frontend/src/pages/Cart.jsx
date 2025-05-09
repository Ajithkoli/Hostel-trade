// pages/Cart.jsx
import { useEffect, useState } from "react";
import { getCartItems, clearCart, removeFromCart } from "../utils/cart";
import { Link } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const handleClearCart = () => {
    clearCart();
    setItems([]);
  };

  const handleRemoveItem = (indexToRemove) => {
    removeFromCart(indexToRemove);
    const updatedItems = getCartItems();
    setItems(updatedItems);
  };

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-10 space-y-4">
            <img
              src="/empty-cart.svg"
              alt="Empty cart"
              className="w-64 h-64 opacity-70"
            />
            <p className="text-lg text-gray-600">Your cart is currently empty.</p>
            <Link to="/products" className="btn btn-primary">
              Go Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="card card-side bg-base-100 shadow-md flex flex-col md:flex-row gap-4 p-4 items-center"
              >
                <figure className="w-full md:w-48 h-48">
                  <img
                    src={
                      item.images && item.images.length > 0
                        ? `${import.meta.env.VITE_SERVER_URL}/${item.images[0]}`
                        : "/placeholder.jpg"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </figure>

                <div className="flex-1 w-full">
                  <h2 className="card-title text-xl">{item.name}</h2>
                  <p className="text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-lg font-bold">₹{item.price}</span>
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${item._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="btn btn-error btn-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <button onClick={handleClearCart} className="btn btn-error">
                Clear All Items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
