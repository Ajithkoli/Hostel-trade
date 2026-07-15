import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
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
    page = 1,
    pages = 1,
    total = 0,
    status,
    error,
  } = useSelector((state) => state.products || {});
  
  // URL Param/Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [intent, setIntent] = useState(searchParams.get("intent") || "All");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [hostel, setHostel] = useState(searchParams.get("hostel") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "date_desc");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  // Sync category changes with URL
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // reset to page 1
  };

  // Debounced effect to fetch filtered results and update URL params
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // 1. Build Query Parameters
      const params = {};
      if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
      if (search.trim()) params.search = search;
      if (intent && intent !== "All") params.intent = intent;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (hostel.trim()) params.hostel = hostel;
      if (sort) params.sort = sort;
      if (currentPage > 1) params.page = currentPage;

      // 2. Update Browser URL Query Params
      setSearchParams(params);

      // 3. Dispatch paginated REST request
      dispatch(fetchProducts(params));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, selectedCategory, search, intent, minPrice, maxPrice, hostel, sort, currentPage]);

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      {/* Drawer toggle for mobile */}
      <input id="category-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Top bar for mobile */}
        <div className="flex justify-between items-center p-4 lg:hidden bg-base-100 shadow-sm">
          <label htmlFor="category-drawer" className="btn btn-outline btn-sm">
            ☰ Filters
          </label>
          <h1 className="text-xl font-bold text-primary">Marketplace</h1>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="alert alert-error shadow-lg mb-6">
              <span>❌ Error: {error}</span>
            </div>
          )}

          {/* Loading Skeletons */}
          {status === "loading" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card w-80 h-[480px] bg-base-100 shadow-md animate-pulse">
                  <div className="h-48 w-full bg-base-300 rounded-t-lg"></div>
                  <div className="card-body p-5 flex flex-col justify-between">
                    <div>
                      <div className="h-5 bg-base-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-base-300 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-base-300 rounded w-full mb-2"></div>
                      <div className="h-4 bg-base-300 rounded w-5/6"></div>
                    </div>
                    <div className="h-4 bg-base-300 rounded w-1/4"></div>
                    <div className="divider my-1"></div>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="h-5 bg-base-300 rounded w-1/4"></div>
                      <div className="h-8 bg-base-300 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card bg-base-100 shadow-md p-12 text-center max-w-xl mx-auto my-20">
              <h2 className="text-xl font-bold mb-2">No Products Found</h2>
              <p className="text-base-content/70">
                Try widening your price range, clearing filters, or entering a different search term.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() => dispatch(addItem(product))}
                  />
                ))}
              </div>

              {/* Server-side Pagination Layout */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 join">
                  <button
                    className="btn join-item btn-sm btn-outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    « Prev
                  </button>
                  <button className="btn join-item btn-sm pointer-events-none bg-base-100">
                    Page {currentPage} of {pages} ({total} items)
                  </button>
                  <button
                    className="btn join-item btn-sm btn-outline"
                    disabled={currentPage === pages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next »
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sidebar: Search & Filter controls */}
      <div className="drawer-side z-40">
        <label htmlFor="category-drawer" className="drawer-overlay"></label>
        <aside className="w-64 bg-base-100 p-6 border-r border-base-300 flex flex-col gap-6 h-full overflow-y-auto">
          <div>
            <h2 className="text-xl font-extrabold text-primary mb-4">Marketplace Filters</h2>
            
            {/* Search Input */}
            <div className="form-control mb-4">
              <label className="label py-1"><span className="label-text font-bold text-xs">Search Keywords</span></label>
              <input
                type="text"
                placeholder="Name, details..."
                className="input input-bordered input-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Hostel Filter */}
            <div className="form-control mb-4">
              <label className="label py-1"><span className="label-text font-bold text-xs">Seller's Hostel</span></label>
              <input
                type="text"
                placeholder="e.g. Krishna"
                className="input input-bordered input-sm"
                value={hostel}
                onChange={(e) => { setHostel(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Price Filter */}
            <div className="form-control mb-4">
              <label className="label py-1"><span className="label-text font-bold text-xs">Price Range (₹)</span></label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="input input-bordered input-sm w-1/2"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="input input-bordered input-sm w-1/2"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {/* Intent Filter */}
            <div className="form-control mb-4">
              <label className="label py-1"><span className="label-text font-bold text-xs">Listing Type</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={intent}
                onChange={(e) => { setIntent(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">Buy or Rent</option>
                <option value="Buy">Buy Outright</option>
                <option value="Rent">Rent Item</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="form-control mb-6">
              <label className="label py-1"><span className="label-text font-bold text-xs">Sort By</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
              >
                <option value="date_desc">Newest Listings</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="date_asc">Oldest Listings</option>
              </select>
            </div>
          </div>

          {/* Categories Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-500 mb-3">Categories</h3>
            <ul className="menu menu-sm p-0 gap-1">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    className={`btn btn-xs text-left justify-start border-none shadow-none font-medium h-8 ${
                      selectedCategory === category
                        ? "btn-primary text-white"
                        : "btn-ghost hover:bg-base-200"
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
