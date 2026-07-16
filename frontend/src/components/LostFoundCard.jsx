import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getImageUrl } from "../utils/image";
import { toast } from "react-toastify";
import api from "../utils/api";
import { updateLostFoundPost } from "../store/lostFoundSlice";

export default function LostFoundCard({ post, onDeleted }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [postStatus, setPostStatus] = useState(post.status || "Open");

  const creatorId = post.createdBy?._id || post.createdBy;
  const isOwner = user && user._id === creatorId;

  const handleToggleStatus = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = postStatus === "Open" ? "Claimed" : "Open";
    
    try {
      const { data } = await api.put(`/api/lost-found/${post._id}`, { status: nextStatus });
      setPostStatus(nextStatus);
      toast.success(`Post marked as ${nextStatus}`);
      if (onDeleted) onDeleted(); // trigger refetch or refresh parent state if needed
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleClosePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await api.put(`/api/lost-found/${post._id}`, { status: "Closed" });
      setPostStatus("Closed");
      toast.success("Post marked as Closed");
      if (onDeleted) onDeleted();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close post");
    }
  };

  return (
    <div className="card w-full max-w-[320px] mx-auto h-[480px] bg-base-100 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden flex flex-col justify-between">
      {/* Post Image and Type Badge */}
      <figure className="h-48 w-full relative bg-base-200">
        {post.images && post.images.length > 0 ? (
          <img
            src={getImageUrl(post.images[0])}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-neutral/10 text-neutral-content/60 font-medium">
            No Image Provided
          </div>
        )}

        {/* Type Overlay Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`badge font-bold px-3 py-2 text-xs shadow-md border-none ${
              post.type === "Lost"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {post.type === "Lost" ? "🔴 Lost" : "🟢 Found"}
          </span>
        </div>

        {/* Claimed overlay */}
        {postStatus === "Claimed" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-extrabold text-xl tracking-wider select-none z-10">
            CLAIMED 🟡
          </div>
        )}
        {postStatus === "Closed" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-extrabold text-xl tracking-wider select-none z-10">
            CLOSED ⚪
          </div>
        )}
      </figure>

      {/* Card Content details */}
      <div className="card-body flex-1 p-5 flex flex-col justify-between">
        <div>
          <h2 className="card-title text-base font-bold line-clamp-1">{post.title}</h2>
          <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
            <span className="badge badge-outline text-[10px] font-semibold">{post.category}</span>
            <span className="badge badge-ghost text-[10px] font-medium truncate max-w-[120px]">
              📍 {post.hostel}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">
            <strong>Location:</strong> {post.location}
          </p>
          <p className="text-[11px] text-gray-500 mb-2">
            <strong>Date:</strong> {post.dateLostOrFound ? new Date(post.dateLostOrFound).toLocaleDateString() : ""}
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 h-8">
            {post.description}
          </p>
        </div>

        <div className="divider my-1"></div>

        {/* Dynamic footer based on ownership */}
        <div className="mt-auto">
          {isOwner ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleToggleStatus}
                  disabled={postStatus === "Closed"}
                  className={`btn btn-xs flex-1 text-white border-none ${
                    postStatus === "Open" ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {postStatus === "Open" ? "Mark Claimed" : "Reopen"}
                </button>
                <button
                  onClick={handleClosePost}
                  disabled={postStatus === "Closed"}
                  className="btn btn-xs btn-outline btn-neutral flex-1"
                >
                  Close Post
                </button>
              </div>
              <Link
                to={`/lost-found/${post._id}`}
                className="btn btn-outline btn-sm w-full"
              >
                Manage details
              </Link>
            </div>
          ) : (
            <div className="card-actions">
              <Link
                to={`/lost-found/${post._id}`}
                className="btn btn-primary btn-sm w-full"
              >
                View Details
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
