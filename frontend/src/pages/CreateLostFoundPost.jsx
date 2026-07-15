import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createLostFoundPost } from "../store/lostFoundSlice";
import { toast } from "react-toastify";

const categories = [
  "Electronics",
  "Books",
  "Documents",
  "Keys",
  "Clothing",
  "Accessories",
  "Miscellaneous",
];

export default function CreateLostFoundPost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "Lost",
    category: categories[0],
    description: "",
    location: "",
    hostel: "",
    dateLostOrFound: "",
    contactPreference: "Chat",
    reward: "",
  });

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

    // Validations
    if (form.reward && Number(form.reward) < 0) {
      return toast.warning("Reward amount cannot be negative");
    }

    if (new Date(form.dateLostOrFound) > new Date()) {
      return toast.warning("Date cannot be in the future");
    }

    setLoading(false);
    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "") {
          data.append(key, val);
        }
      });
      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      await dispatch(createLostFoundPost(data)).unwrap();
      toast.success("✅ Post created successfully!");
      navigate("/lost-found");
    } catch (error) {
      toast.error(error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-base-100 rounded-2xl shadow-lg my-10 border border-base-300">
      <h2 className="text-4xl font-bold text-center mb-8">Report Lost/Found Item</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        
        {/* Post Title */}
        <div className="form-control">
          <label className="label font-medium">Post Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Lost Black Leather Wallet, Found Keys with Keychain..."
            className="input input-bordered w-full"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Post Type (Lost or Found) */}
        <div className="form-control">
          <label className="label font-medium">Post Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="Lost"
                checked={form.type === "Lost"}
                onChange={handleChange}
                className="radio radio-error"
              />
              <span className="font-semibold text-sm">🔴 Lost Item</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="Found"
                checked={form.type === "Found"}
                onChange={handleChange}
                className="radio radio-success"
              />
              <span className="font-semibold text-sm"> 🟢 Found Item</span>
            </label>
          </div>
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Hostel and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label font-medium">Hostel (e.g. BH-1, GH-3)</label>
            <input
              type="text"
              name="hostel"
              placeholder="e.g. BH-1"
              className="input input-bordered w-full"
              value={form.hostel}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label className="label font-medium">Specific Location (e.g. Mess, Room 204)</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Near badminton court"
              className="input input-bordered w-full"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Date and Reward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label font-medium">Date Lost/Found</label>
            <input
              type="date"
              name="dateLostOrFound"
              className="input input-bordered w-full"
              value={form.dateLostOrFound}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label className="label font-medium">Reward Offered (₹ - Optional)</label>
            <input
              type="number"
              name="reward"
              placeholder="e.g. 200 (For lost posts only)"
              className="input input-bordered w-full"
              value={form.reward}
              onChange={handleChange}
              disabled={form.type === "Found"}
            />
          </div>
        </div>

        {/* Contact Preference */}
        <div className="form-control">
          <label className="label font-medium">Contact Preference</label>
          <select
            name="contactPreference"
            className="select select-bordered w-full"
            value={form.contactPreference}
            onChange={handleChange}
            required
          >
            <option value="Chat">Chat with me (In-app messages)</option>
            <option value="Email">Email (Public student email)</option>
            <option value="Phone">Phone / Direct call</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-control">
          <label className="label font-medium">Item Description</label>
          <textarea
            name="description"
            rows="4"
            placeholder="Describe the item's key features, color, brand, condition, and how to verify ownership..."
            className="textarea textarea-bordered w-full"
            value={form.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Images Upload */}
        <div className="form-control">
          <label className="label font-medium">Images (Max 3)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Select up to 3 files to help identify the item.</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full mt-4"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Submit Post"
          )}
        </button>

      </form>
    </div>
  );
}
