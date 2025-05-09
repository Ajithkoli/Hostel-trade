// src/pages/AdminProductManagement.jsx
import React, { useEffect, useState } from "react";

export default function AdminProductManagement() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Replace with your real fetch logic
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== productId));
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="p-6 flex-1">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>
      <div className="overflow-x-auto">
        <table className="table w-full table-zebra">
          <thead>
            <tr className="bg-gray-200 text-gray-800">
              <th>#</th>
              <th>Name</th>
              <th>Price</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={product._id}>
                <td>{idx + 1}</td>
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td className="text-center">
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
