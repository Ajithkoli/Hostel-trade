import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, updateAvatar, changePassword, deleteAccount } from "../store/authSlice";
import { getImageUrl } from "../utils/image";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import LostFoundCard from "../components/LostFoundCard";

export default function Profile() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("settings");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Profile forms state
  const [profileName, setProfileName] = useState("");
  const [profileHostel, setProfileHostel] = useState("");

  // Password forms state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initialize profile form
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileHostel(user.hostel || "");
    }
  }, [user]);

  // Fetch wishlist or lostfound on tab activation
  useEffect(() => {
    if (activeTab === "wishlist") {
      fetchWishlist();
    } else if (activeTab === "lostfound") {
      fetchMyLostFoundPosts();
    }
  }, [activeTab]);

  const fetchMyLostFoundPosts = async () => {
    setPostsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = userInfo?.token
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};
      const { data } = await axios.get("/api/lost-found/myposts", config);
      setMyPosts(data);
    } catch (error) {
      toast.error("Failed to load your posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      const { data } = await axios.get("/api/auth/wishlist", {
        withCredentials: true,
      });
      setWishlistItems(data);
    } catch (error) {
      toast.error("Failed to load wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      return toast.warning("Name cannot be empty");
    }
    try {
      await dispatch(updateProfile({ name: profileName, hostel: profileHostel })).unwrap();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type and size
    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image file");
    }
    if (file.size > 3 * 1024 * 1024) {
      return toast.error("Image must be smaller than 3MB");
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      await dispatch(updateAvatar(formData)).unwrap();
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err || "Failed to upload avatar");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.warning("Please fill in all password fields");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: This action is permanent! All your product listings, images, and chat conversations will be deleted. Are you sure you want to delete your account?"
    );
    if (!confirmDelete) return;

    try {
      await dispatch(deleteAccount()).unwrap();
      toast.success("Account deleted. Goodbye!");
    } catch (err) {
      toast.error(err || "Failed to delete account");
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await axios.post(`/api/auth/wishlist/${productId}`, {}, { withCredentials: true });
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
      toast.info("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl p-8 text-center">
          <p className="text-lg font-medium mb-4">Please log in to view your profile</p>
          <Link to="/login" className="btn btn-primary w-full">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Card & Quick Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="card bg-base-100 shadow-xl p-6 text-center items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <figure className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg relative">
                <img
                  src={getImageUrl(user.profilePicture)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                  Change Photo
                </div>
              </figure>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            
            <h2 className="text-2xl font-bold mt-4 text-base-content">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{user.email}</p>
            <div className="badge badge-primary gap-1 capitalize font-medium">{user.role}</div>
            
            <div className="divider w-full my-4"></div>
            
            <div className="w-full flex flex-col gap-2 text-left text-sm text-base-content/80">
              <div><strong>Hostel:</strong> {user.hostel || "Not specified"}</div>
              <div><strong>Status:</strong> {user.verified ? "Approved" : "Pending Approval"}</div>
            </div>

            <div className="divider w-full my-4"></div>
            
            <div className="w-full flex flex-col gap-2">
              <Link to="/dashboard" className="btn btn-outline btn-primary btn-sm w-full">
                Manage My Listings
              </Link>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-sm btn-ghost btn-error text-error hover:bg-error/20 w-full mt-4"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Content Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card bg-base-100 shadow-xl p-6">
            
            {/* Tabs Navigation */}
            <div className="tabs tabs-boxed w-full mb-6 flex flex-wrap">
              <button
                className={`tab flex-1 font-medium ${activeTab === "settings" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                Account Settings
              </button>
              <button
                className={`tab flex-1 font-medium ${activeTab === "wishlist" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("wishlist")}
              >
                My Wishlist ({user.wishlist?.length || 0})
              </button>
              <button
                className={`tab flex-1 font-medium ${activeTab === "lostfound" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("lostfound")}
              >
                Lost & Found Posts
              </button>
            </div>

            {/* Tab Contents: Settings */}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-8">
                
                {/* Details Form */}
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold border-b pb-2">Update Personal Details</h3>
                  <div className="form-control">
                    <label className="label font-medium text-sm">Full Name</label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-medium text-sm">Hostel / Hall</label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="e.g. Krishna, Cauvery, Narmada"
                      value={profileHostel}
                      onChange={(e) => setProfileHostel(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-fit self-end mt-2" disabled={loading}>
                    {loading ? <span className="loading loading-spinner"></span> : "Save Changes"}
                  </button>
                </form>

                {/* Password Form */}
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold border-b pb-2">Change Password</h3>
                  <div className="form-control">
                    <label className="label font-medium text-sm">Current Password</label>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-medium text-sm">New Password</label>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-medium text-sm">Confirm New Password</label>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-fit self-end mt-2">
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Tab Contents: Wishlist */}
            {activeTab === "wishlist" && (
              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">Saved Listings</h3>
                {wishlistLoading ? (
                  <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-10 text-base-content/70">
                    <p className="mb-4">Your wishlist is empty.</p>
                    <Link to="/marketplace" className="btn btn-primary btn-sm">Browse Marketplace</Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {wishlistItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex gap-4 items-center justify-between p-4 border rounded-xl bg-base-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <figure className="w-16 h-16 rounded-lg overflow-hidden border">
                            <img
                              src={getImageUrl(item.images?.[0])}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </figure>
                          <div>
                            <h4 className="font-bold text-base">{item.name}</h4>
                            <p className="text-xs text-gray-500 capitalize">{item.intent} • ₹{item.price}</p>
                            <p className="text-[10px] text-primary">{item.user?.hostel || "Hostel"} Resident</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/products/${item._id}`} className="btn btn-sm btn-outline">
                            View
                          </Link>
                          <button
                            onClick={() => handleRemoveFromWishlist(item._id)}
                            className="btn btn-sm btn-error btn-ghost text-error"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Contents: Lost & Found */}
            {activeTab === "lostfound" && (
              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">My Lost & Found Posts</h3>
                {postsLoading ? (
                  <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="text-center py-10 text-base-content/70">
                    <p className="mb-4">You have not reported any lost or found items yet.</p>
                    <Link to="/lost-found/create" className="btn btn-primary btn-sm">Report An Item</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {myPosts.map((post) => (
                      <LostFoundCard
                        key={post._id}
                        post={post}
                        onDeleted={fetchMyLostFoundPosts}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
