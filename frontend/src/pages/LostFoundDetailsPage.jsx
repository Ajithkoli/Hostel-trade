import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLostFoundPostDetails, deleteLostFoundPost, resetCurrentItem } from "../store/lostFoundSlice";
import { getImageUrl } from "../utils/image";
import { toast } from "react-toastify";
import LostFoundCard from "../components/LostFoundCard";

export default function LostFoundDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { currentItem: item, relatedItems = [], detailsStatus, error } = useSelector((state) => state.lostFound);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    dispatch(fetchLostFoundPostDetails(id));
    return () => {
      dispatch(resetCurrentItem());
    };
  }, [dispatch, id]);

  if (detailsStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <p className="text-red-500 text-xl font-bold">{error || "Post not found"}</p>
      </div>
    );
  }

  const imageUrls = item.images?.map((img) => getImageUrl(img)) || [];
  const creatorId = item.createdBy?._id || item.createdBy;
  const isOwner = user && user._id === creatorId;

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      await dispatch(deleteLostFoundPost(item._id)).unwrap();
      toast.success("Post deleted successfully");
      navigate("/lost-found");
    } catch (err) {
      toast.error(err || "Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Link */}
        <Link to="/lost-found" className="btn btn-ghost btn-sm mb-4">
          ← Back to Hub
        </Link>

        {/* Details Wrapper */}
        <div className="card bg-base-100 shadow-xl flex flex-col lg:flex-row overflow-hidden mb-12">
          {/* Gallery frame */}
          <div className="lg:w-1/2 bg-neutral/5 p-4 flex flex-col justify-center border-r border-base-200">
            <div className="carousel w-full rounded-lg bg-base-300">
              {imageUrls.length > 0 ? (
                imageUrls.map((img, index) => (
                  <div
                    key={index}
                    id={`item${index}`}
                    className="carousel-item w-full flex justify-center items-center h-[350px] sm:h-[450px]"
                  >
                    <img
                      src={img}
                      className="max-h-full max-w-full object-contain cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                      alt={`Post attachment ${index}`}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full h-[350px] sm:h-[450px] flex items-center justify-center text-gray-500 font-medium bg-neutral/10">
                  No images provided
                </div>
              )}
            </div>

            {/* Carousel navigation indicators */}
            {imageUrls.length > 1 && (
              <div className="flex justify-center mt-3 gap-2">
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
            )}
          </div>

          {/* Details column */}
          <div className="card-body lg:w-1/2 p-8 flex flex-col justify-between">
            <div>
              {/* Type, category badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`badge font-extrabold px-3 py-1 text-xs border-none text-white ${
                    item.type === "Lost" ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {item.type === "Lost" ? "🔴 Lost" : "🟢 Found"}
                </span>
                <span className="badge badge-outline">{item.category}</span>
                {item.status !== "Open" && (
                  <span
                    className={`badge text-white ${
                      item.status === "Claimed" ? "badge-warning text-black" : "badge-neutral"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black mb-4 text-base-content">{item.title}</h1>

              {/* Reward callout */}
              {item.reward !== undefined && item.reward > 0 && (
                <div className="alert bg-yellow-100/60 border border-yellow-300 text-yellow-800 shadow-sm mb-4 py-3 flex gap-2">
                  <span>💰</span>
                  <span className="font-extrabold text-sm">Reward Offered: ₹{item.reward}</span>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-base-content/80 bg-base-200/50 p-4 rounded-xl">
                <div>
                  <strong>📍 Hostel:</strong> {item.hostel}
                </div>
                <div>
                  <strong>📍 Location:</strong> {item.location}
                </div>
                <div>
                  <strong>📅 Date:</strong>{" "}
                  {item.dateLostOrFound ? new Date(item.dateLostOrFound).toLocaleDateString() : ""}
                </div>
                <div>
                  <strong>📞 Preference:</strong> {item.contactPreference}
                </div>
              </div>

              {/* Description */}
              <h3 className="text-lg font-bold mb-2">Description</h3>
              <p className="text-base-content/80 mb-6 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* CTAs */}
            <div>
              <div className="divider my-4"></div>
              {isOwner ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleDelete}
                    className="btn btn-error flex-1"
                  >
                    Delete Post
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/inbox?receiver=${creatorId}`}
                    className="btn btn-primary w-full"
                  >
                    💬 Contact Owner (Chat)
                  </Link>
                  {item.contactPreference !== "Chat" && (
                    <div className="text-center text-xs text-base-content/60 mt-1">
                      {item.contactPreference === "Email" && (
                        <span>Owner prefers email: <strong>{item.createdBy?.email}</strong></span>
                      )}
                      {item.contactPreference === "Phone" && (
                        <span>Check details below for contact phone</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="divider my-4"></div>

              {/* Owner details */}
              <div>
                <h4 className="font-bold text-sm text-base-content/50 uppercase tracking-wider mb-2">
                  Posted By
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-primary bg-base-200">
                    <img
                      src={getImageUrl(item.createdBy?.profilePicture)}
                      className="w-full h-full object-cover"
                      alt={item.createdBy?.name}
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">{item.createdBy?.name || "Unknown"}</h5>
                    <p className="text-xs text-base-content/60">{item.createdBy?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((rel) => (
                <LostFoundCard key={rel._id} post={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Large Image lightbox */}
      {selectedImage && (
        <dialog
          id="imageLightbox"
          className="modal modal-open"
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-box max-w-4xl p-2 bg-base-100 flex flex-col items-center">
            <img
              src={selectedImage}
              alt="Lightbox view"
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            <div className="modal-action w-full justify-end mt-2 pr-2">
              <button className="btn btn-sm" onClick={() => setSelectedImage(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
