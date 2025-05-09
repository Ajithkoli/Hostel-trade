import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Define categories before using them in state
const categories = [
  "Electronics",
  "Books",
  "Electrical",
  "Vehicles",
  "Miscellaneous",
];

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    category: categories[0],
    description: "",
    price: "",
    stock: "",
    intent: "Buy",
  });

  // For image files upload (up to 3)
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // limit to 3 files
    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      // Append form fields to the FormData
      Object.entries(form).forEach(([key, val]) => {
        data.append(key, val);
      });
      // Append all selected images with field name "images"
      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      // Adjust the endpoint if necessary (here we use /api/products to match our redux slice)
      await axios.post("/api/products", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ Product added successfully");
      // Reset form and images
      setForm({
        name: "",
        category: categories[0],
        description: "",
        price: "",
        stock: "",
        intent: "Buy",
      });
      setImageFiles([]);
    } catch (error) {
      const msg = error?.response?.data?.message || "❌ Failed to add product";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-base-100 rounded-2xl shadow-lg my-10 border border-base-300">
      <h2 className="text-4xl font-bold text-center mb-8">Add New Product</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        {/* Product Name */}
        <div className="form-control">
          <label className="label font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            className="input input-bordered w-full"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div className="form-control">
          <label className="label font-medium">Category</label>
          <select
            name="category"
            className="select select-bordered w-full"
            value={form.category}
            onChange={handleChange}
            required
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Intent */}
        <div className="form-control">
          <label className="label font-medium">Intent</label>
          <select
            name="intent"
            className="select select-bordered w-full"
            value={form.intent}
            onChange={handleChange}
            required
          >
            <option value="Buy">Buy</option>
            <option value="Rent">Rent</option>
          </select>
        </div>

        {/* Price */}
        <div className="form-control">
          <label className="label font-medium">Price (₹)</label>
          <input
            type="number"
            name="price"
            className="input input-bordered w-full"
            value={form.price}
            onChange={handleChange}
            required
            min={0}
          />
        </div>

        {/* Stock */}
        <div className="form-control">
          <label className="label font-medium">Stock</label>
          <input
            type="number"
            name="stock"
            className="input input-bordered w-full"
            value={form.stock}
            onChange={handleChange}
            required
            min={0}
          />
        </div>

        {/* Description */}
        <div className="form-control">
          <label className="label font-medium">Description</label>
          <textarea
            name="description"
            className="textarea textarea-bordered w-full"
            rows={4}
            value={form.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Image Upload */}
        <div className="form-control">
          <label className="label font-medium">Upload up to 3 Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="file-input file-input-bordered"
            onChange={handleFileChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`btn btn-primary w-full mt-4 ${
            loading ? "btn-disabled" : ""
          }`}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner mr-2" />
              Adding...
            </>
          ) : (
            "Add Product"
          )}
        </button>
      </form>
    </div>
  );
}
