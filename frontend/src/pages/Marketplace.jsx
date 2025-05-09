import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../store/productSlice";
import { addItem } from "../store/cartSlice";

const categories = [
  "All",
  "Electronics",
  "Books",
  "Electrical",
  "Vehicles",
  "Miscellaneous",
];

export default function Marketplace() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    items: products = [],
    status,
    error,
  } = useSelector((state) => state.products || {});
  
  // Get category from URL or default to "All"
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Update URL when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  // Initialize category from URL on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      {/* Drawer toggle for mobile */}
      <input id="category-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Top bar for mobile */}
        <div className="flex justify-between items-center p-4 lg:hidden">
          <label htmlFor="category-drawer" className="btn btn-outline">
            ☰ Categories
          </label>
          <h1 className="text-2xl font-bold">Marketplace</h1>
        </div>

        <div className="p-4">
          {/* Error Message */}
          {error && (
            <div className="text-center text-error text-lg font-medium mb-4">
              ❌ Error: {error}
            </div>
          )}

          {/* Loading spinner */}
          {status === "loading" ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-lg text-base-content/70 py-20">
              No products found in this category.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() => dispatch(addItem(product))}
                  />
                ))}
              </div>
              {/* View More Button */}
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="category-drawer" className="drawer-overlay"></label>
        <aside className="w-64 bg-base-100 p-6 border-r border-base-300">
          <h2 className="text-xl font-bold mb-6">Categories</h2>
          <ul className="menu gap-2">
            {categories.map((category) => (
              <li key={category}>
                <button
                  className={`btn w-full text-left ${
                    selectedCategory === category
                      ? "btn-primary"
                      : "btn-ghost hover:bg-base-200"
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
