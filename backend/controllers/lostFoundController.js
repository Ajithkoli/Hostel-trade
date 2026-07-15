import LostFound from "../models/LostFound.js";
import User from "../models/User.js";
import { uploadToCloudinary, extractPublicId, deleteFromCloudinary } from "../utils/cloudinary.js";
import { escapeRegex } from "../utils/escapeRegex.js";

// @desc    Get all lost & found items
// @route   GET /api/lost-found
// @access  Public
export const getAllLostFound = async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      hostel,
      status,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = {};

    // 1. Search (Title, Description, Category, Hostel, Location) (escaped against ReDoS)
    if (search) {
      const escapedSearch = escapeRegex(search);
      const searchRegex = { $regex: escapedSearch, $options: "i" };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { hostel: searchRegex },
        { location: searchRegex },
      ];
    }

    // 2. Filters (escaped against ReDoS)
    if (type && type !== "All") {
      query.type = type;
    }
    if (category && category !== "All") {
      const escapedCategory = escapeRegex(category);
      query.category = { $regex: new RegExp(`^${escapedCategory}$`, "i") };
    }
    if (hostel && hostel !== "All") {
      const escapedHostel = escapeRegex(hostel);
      query.hostel = { $regex: new RegExp(`^${escapedHostel}$`, "i") };
    }
    if (status && status !== "All") {
      query.status = status;
    }

    // 3. Sorting
    let sortOption = { createdAt: -1 }; // default: recently added
    if (sort === "date_asc") {
      sortOption = { dateLostOrFound: 1 };
    } else if (sort === "date_desc") {
      sortOption = { dateLostOrFound: -1 };
    } else if (sort === "recently_added") {
      sortOption = { createdAt: -1 };
    }

    // 4. Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const total = await LostFound.countDocuments(query);
    const items = await LostFound.find(query)
      .populate("createdBy", "name email hostel profilePicture")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      items,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lost & found posts", error: error.message });
  }
};

// @desc    Get single lost & found item
// @route   GET /api/lost-found/:id
// @access  Public
export const getLostFoundById = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate("createdBy", "name email hostel profilePicture");
      
    if (!item) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch related items (same category or hostel, excluding current item)
    const relatedItems = await LostFound.find({
      _id: { $ne: item._id },
      $or: [{ category: item.category }, { hostel: item.hostel }],
    })
      .limit(3)
      .populate("createdBy", "name email hostel profilePicture");

    res.json({ item, relatedItems });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving post details", error: error.message });
  }
};

// @desc    Create a new lost & found item
// @route   POST /api/lost-found
// @access  Private
export const createLostFound = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      location,
      hostel,
      dateLostOrFound,
      contactPreference,
      reward,
    } = req.body;

    // Validate inputs
    if (!title || !description || !type || !category || !location || !hostel || !dateLostOrFound) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Handle files upload to Cloudinary
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        if (cloudinaryUrl) {
          imagePaths.push(cloudinaryUrl);
        }
      }
    }

    const newItem = new LostFound({
      title,
      description,
      type,
      category,
      location,
      hostel,
      dateLostOrFound,
      contactPreference,
      reward: reward ? Number(reward) : undefined,
      images: imagePaths,
      createdBy: req.user._id,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: "Error creating post", error: error.message });
  }
};

// @desc    Update a lost & found item
// @route   PUT /api/lost-found/:id
// @access  Private (Owner only)
export const updateLostFound = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      location,
      hostel,
      dateLostOrFound,
      contactPreference,
      reward,
      status,
    } = req.body;

    const item = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure the logged-in user is the owner
    if (!item.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Handle files upload to Cloudinary if new images are supplied
    let imagePaths = undefined;
    if (req.files && req.files.length > 0) {
      imagePaths = [];
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        if (cloudinaryUrl) {
          imagePaths.push(cloudinaryUrl);
        }
      }

      // Cleanup old images
      if (item.images && item.images.length > 0) {
        for (const oldImage of item.images) {
          const publicId = extractPublicId(oldImage);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }
      }
    }

    item.title = title || item.title;
    item.description = description || item.description;
    item.type = type || item.type;
    item.category = category || item.category;
    item.location = location || item.location;
    item.hostel = hostel || item.hostel;
    item.dateLostOrFound = dateLostOrFound || item.dateLostOrFound;
    item.contactPreference = contactPreference || item.contactPreference;
    item.reward = reward !== undefined ? (reward ? Number(reward) : undefined) : item.reward;
    item.status = status || item.status;
    if (imagePaths && imagePaths.length > 0) {
      item.images = imagePaths;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Failed to update post", error: error.message });
  }
};

// @desc    Delete a lost & found item
// @route   DELETE /api/lost-found/:id
// @access  Private (Owner only)
export const deleteLostFound = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure the logged-in user is the owner
    if (!item.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Cleanup images from Cloudinary
    if (item.images && item.images.length > 0) {
      for (const imageUrl of item.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    await item.deleteOne();
    res.json({ message: "Post removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

// @desc    Get lost & found items created by the logged-in user
// @route   GET /api/lost-found/myposts
// @access  Private
export const getUserLostFound = async (req, res) => {
  try {
    const items = await LostFound.find({ createdBy: req.user._id })
      .populate("createdBy", "name email hostel profilePicture")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your posts", error: error.message });
  }
};
