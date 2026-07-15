import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { fetchLostFoundPosts } from "../store/lostFoundSlice";
import LostFoundCard from "../components/LostFoundCard";

const categories = [
  "All",
  "Electronics",
  "Books",
  "Documents",
  "Keys",
  "Clothing",
  "Accessories",
  "Miscellaneous",
];

export default function LostFoundPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const {
    items = [],
    page = 1,
    pages = 1,
    total = 0,
    status,
    error,
  } = useSelector((state) => state.lostFound || {});

  // URL Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [hostel, setHostel] = useState(searchParams.get("hostel") || "");
  const [postStatus, setPostStatus] = useState(searchParams.get("status") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "recently_added");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  // Debounced sync with API & searchParams
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = {};
      if (search.trim()) params.search = search;
      if (type && type !== "All") params.type = type;
      if (category && category !== "All") params.category = category;
      if (hostel.trim()) params.hostel = hostel;
      if (postStatus && postStatus !== "All") params.status = postStatus;
      if (sort) params.sort = sort;
      if (currentPage > 1) params.page = currentPage;

      setSearchParams(params);
      dispatch(fetchLostFoundPosts(params));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, search, type, category, hostel, postStatus, sort, currentPage]);

  const handleRefresh = () => {
    const params = {};
    if (search.trim()) params.search = search;
    if (type && type !== "All") params.type = type;
    if (category && category !== "All") params.category = category;
    if (hostel.trim()) params.hostel = hostel;
    if (postStatus && postStatus !== "All") params.status = postStatus;
    if (sort) params.sort = sort;
    if (currentPage > 1) params.page = currentPage;
    dispatch(fetchLostFoundPosts(params));
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="lost-found-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Mobile Nav Top Bar */}
        <div className="flex justify-between items-center p-4 lg:hidden bg-base-100 shadow-sm">
          <label htmlFor="lost-found-drawer" className="btn btn-outline btn-sm">
            ☰ Filters
          </label>
          <h1 className="text-xl font-bold text-primary">Lost & Found</h1>
          <Link
            to={user ? "/lost-found/create" : "/login"}
            className="btn btn-primary btn-sm"
          >
            + Report
          </Link>
        </div>

        <div className="p-6">
          {/* Headline and CTAs */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-base-content">Lost & Found Hub</h1>
              <p className="text-sm text-base-content/60">Report lost or found items and help your hostel community.</p>
            </div>
            <Link
              to={user ? "/lost-found/create" : "/login"}
              className="btn btn-primary px-6"
            >
              + Report Lost/Found Item
            </Link>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error shadow-lg mb-6">
              <span>❌ Error: {error}</span>
            </div>
          )}

          {/* Search bar & Sorting bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-base-100 p-4 rounded-xl shadow-sm">
            <div className="md:col-span-8">
              <input
                type="text"
                placeholder="Search lost & found posts by title, location..."
                className="input input-bordered w-full"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="md:col-span-4">
              <select
                className="select select-bordered w-full"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="recently_added">Recently Added</option>
                <option value="date_desc">Date: Newest First</option>
                <option value="date_asc">Date: Oldest First</option>
              </select>
            </div>
          </div>

          {/* Main Listings Content */}
          {status === "loading" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card w-full max-w-[320px] mx-auto h-[480px] bg-base-100 shadow-md animate-pulse">
                  <div className="h-48 w-full bg-base-300 rounded-t-lg"></div>
                  <div className="card-body p-5 flex flex-col justify-between">
                    <div>
                      <div className="h-5 bg-base-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-base-300 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-base-300 rounded w-full mb-2"></div>
                      <div className="h-4 bg-base-300 rounded w-5/6"></div>
                    </div>
                    <div className="h-4 bg-base-300 rounded w-1/4 mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card bg-base-100 shadow-md p-12 text-center max-w-xl mx-auto my-12">
              <h2 className="text-xl font-bold mb-2">No Items Found</h2>
              <p className="text-base-content/70">
                Try resetting your filters, search term, or create a new post to get started!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((post) => (
                  <LostFoundCard key={post._id} post={post} onDeleted={handleRefresh} />
                ))}
              </div>

              {/* Pagination controls */}
              {pages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="join">
                    <button
                      className="join-item btn btn-outline btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      « Previous
                    </button>
                    {[...Array(pages)].map((_, idx) => (
                      <button
                        key={idx}
                        className={`join-item btn btn-sm ${
                          currentPage === idx + 1 ? "btn-primary text-white" : "btn-outline"
                        }`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      className="join-item btn btn-outline btn-sm"
                      disabled={currentPage === pages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pages))}
                    >
                      Next »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Side Filters Drawer (visible on desktop, drawer on mobile) */}
      <div className="drawer-side z-40">
        <label htmlFor="lost-found-drawer" className="drawer-overlay"></label>
        <div className="p-6 w-80 min-h-full bg-base-100 text-base-content border-r border-base-300">
          <h2 className="text-xl font-black mb-6 tracking-wide text-primary">Filters</h2>

          {/* Quick Item Type Selector */}
          <div className="mb-6">
            <label className="label font-bold text-xs uppercase tracking-wider text-base-content/50">Post Type</label>
            <div className="join w-full">
              <button
                onClick={() => {
                  setType("All");
                  setCurrentPage(1);
                }}
                className={`btn btn-sm join-item flex-1 ${type === "All" ? "btn-primary text-white" : "btn-outline"}`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setType("Lost");
                  setCurrentPage(1);
                }}
                className={`btn btn-sm join-item flex-1 ${type === "Lost" ? "btn-primary text-white" : "btn-outline"}`}
              >
                Lost
              </button>
              <button
                onClick={() => {
                  setType("Found");
                  setCurrentPage(1);
                }}
                className={`btn btn-sm join-item flex-1 ${type === "Found" ? "btn-primary text-white" : "btn-outline"}`}
              >
                Found
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <label className="label font-bold text-xs uppercase tracking-wider text-base-content/50">Status</label>
            <select
              className="select select-bordered w-full select-sm"
              value={postStatus}
              onChange={(e) => {
                setPostStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Claimed">Claimed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Hostel Filter */}
          <div className="mb-6">
            <label className="label font-bold text-xs uppercase tracking-wider text-base-content/50">Hostel</label>
            <input
              type="text"
              placeholder="Filter by hostel (e.g. BH-1)..."
              className="input input-bordered w-full input-sm"
              value={hostel}
              onChange={(e) => {
                setHostel(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Categories Sidebar List */}
          <div>
            <label className="label font-bold text-xs uppercase tracking-wider text-base-content/50 mb-2">
              Categories
            </label>
            <ul className="menu bg-base-100 p-0 rounded-box gap-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategorySelect(cat)}
                    className={`btn btn-xs text-left justify-start border-none shadow-none font-medium h-8 ${
                      category === cat ? "btn-primary text-white" : "btn-ghost hover:bg-base-200"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
