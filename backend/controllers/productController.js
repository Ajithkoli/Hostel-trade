import Product from "../models/Product.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import { uploadToCloudinary, extractPublicId, deleteFromCloudinary } from "../utils/cloudinary.js";
import { escapeRegex } from "../utils/escapeRegex.js";

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, intent, minPrice, maxPrice, hostel, sort, page = 1, limit = 9 } = req.query;

    const query = {};

    // 1. Name and description search (escaped against ReDoS)
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } }
      ];
    }

    // 2. Category filter (escaped against ReDoS)
    if (category && category !== "All") {
      const escapedCategory = escapeRegex(category);
      query.category = { $regex: new RegExp(`^${escapedCategory}$`, "i") };
    }

    // 3. Buy/Rent intent filter
    if (intent && intent !== "All") {
      query.intent = intent;
    }

    // 4. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Seller's hostel filter (escaped against ReDoS)
    if (hostel && hostel !== "All") {
      const escapedHostel = escapeRegex(hostel);
      const usersInHostel = await User.find({ hostel: { $regex: escapedHostel, $options: "i" } }).select("_id");
      const userIds = usersInHostel.map(u => u._id);
      query.user = { $in: userIds };
    }

    // Only return Available products by default (unless specified by dashboard view request)
    if (!req.query.showAll) {
      query.status = { $ne: "Sold" };
    }

    console.log("getAllProducts Query Params:", req.query);
    console.log("Constructed MongoDB Query:", JSON.stringify(query));

    // 6. Sorting options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "date_desc") {
      sortOption = { createdAt: -1 };
    } else if (sort === "date_asc") {
      sortOption = { createdAt: 1 };
    }

    // 7. Pagination math
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("user")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// GET a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("user");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving product", error: err });
  }
};

// CREATE a new product with file uploads
export const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock, intent } = req.body;
    
    // Map the uploaded files to Cloudinary URLs
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        if (cloudinaryUrl) {
          imagePaths.push(cloudinaryUrl);
        }
      }
    }

    const newProduct = new Product({
      name,
      category,
      description,
      price,
      images: imagePaths, // Save the array of image paths
      stock,
      intent,
      user: req.user._id,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: "Error creating product", error });
  }
};

// UPDATE a product (optionally update images)
export const updateProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock, intent } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ensure the logged-in user is owner or has proper rights (not implemented here).
    if (!product.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If new files are uploaded, upload them to Cloudinary and replace existing images.
    let imagePaths = undefined;
    if (req.files && req.files.length > 0) {
      imagePaths = [];
      for (const file of req.files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        if (cloudinaryUrl) {
          imagePaths.push(cloudinaryUrl);
        }
      }
      
      // Clean up old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const oldImage of product.images) {
          const publicId = extractPublicId(oldImage);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }
      }
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.intent = intent || product.intent;
    if (imagePaths && imagePaths.length > 0) {
      product.images = imagePaths;
    }
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err });
  }
};

// DELETE a product (accessible by seller or admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Allow if user is product owner (seller) OR is an admin
    const isSeller = product.user.equals(req.user._id);
    const isAdmin = req.user.role == "admin";

    if (!isSeller && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    // Clean up images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        const publicId = extractPublicId(image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete product", error: err });
  }
};



export const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).populate("user");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user products", error: err });
  }
};

// UPDATE product status (Available/Sold)
export const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Available", "Sold"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to modify this listing" });
    }

    product.status = status;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Failed to update product status", error: error.message });
  }
};

// RENEW product listing (bumps to top)
export const renewProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to renew this listing" });
    }

    // Refresh listing creation date to now
    product.createdAt = new Date();
    const updatedProduct = await product.save();
    res.json({ message: "Listing renewed successfully", product: updatedProduct });
  } catch (error) {
    res.status(400).json({ message: "Failed to renew listing", error: error.message });
  }
};

// REPORT product listing
export const reportProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Please specify a reason" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.user.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot report your own listing" });
    }

    const existingReport = await Report.findOne({ reporter: req.user._id, product: product._id });
    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this listing" });
    }

    const report = new Report({
      reporter: req.user._id,
      product: product._id,
      reason
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to submit report", error: error.message });
  }
};