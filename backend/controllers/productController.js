import Product from "../models/Product.js";

// GET all products
export const getAllProducts = async (req, res) => {
  // console.log("hiii");
  try {
    const products = await Product.find().populate("user");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err });
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
    // Map the uploaded files to image paths
    const imagePaths = req.files?.map((file) => file.path) || [];
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
    // If new files are uploaded, map them; otherwise, keep existing images.
    const imagePaths = req.files?.map((file) => file.path);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ensure the logged-in user is owner or has proper rights (not implemented here).
    if (!product.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
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

// DELETE a product
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