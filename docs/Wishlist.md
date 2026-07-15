# Wishlist Architecture & Implementation

This document describes the design, API handlers, and frontend integration of the **Wishlist** feature in **Hostel Trade**.

---

## 1. Database Schema Design

The wishlist is stored directly inside the User document as an array of product references, rather than using a separate database collection. This design simplifies queries by keeping user-specific listings data grouped together:

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  // ... other fields
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
});
```

---

## 2. API Implementation (`authController.js`)

### 1. Toggle Wishlist Item
* **Route**: `POST /api/auth/wishlist/:productId`
* **Authentication Required**: Yes.
* **Controller**: `toggleWishlist`
* **Logic**:
  - Finds the logged-in user by ID.
  - Checks if the `productId` is already in the user's `wishlist` array.
  - If not in array, pushes it (`wishlist.push(productId)`).
  - If already in array, removes it (`wishlist.splice(index, 1)`).
  - Saves the updated user document and returns the new wishlist array to keep the client UI in sync.

```javascript
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!user.wishlist) user.wishlist = [];

  const index = user.wishlist.indexOf(productId);
  let message = "";

  if (index === -1) {
    user.wishlist.push(productId);
    message = "Product added to wishlist";
  } else {
    user.wishlist.splice(index, 1);
    message = "Product removed from wishlist";
  }

  await user.save();
  res.json({ success: true, message, wishlist: user.wishlist });
});
```

---

### 2. Get Wishlist Items
* **Route**: `GET /api/auth/wishlist`
* **Authentication Required**: Yes.
* **Controller**: `getWishlist`
* **Logic**:
  - Finds the user by ID and populates the `wishlist` array with product details, including the seller's name, email, and hostel info:
  ```javascript
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "user", select: "name email hostel" }
  });
  res.json(user.wishlist || []);
  ```

---

## 3. Frontend & State Integration

### 1. Redux Integration (`authSlice.js`)
* **Async Thunk**: `toggleWishlist(productId)`
  - Calls the toggle API.
  - Updates the `userInfo` object in `localStorage` to keep the user's wishlist in sync across browser refreshes:
  ```javascript
  const response = await axios.post(`/api/auth/wishlist/${productId}`);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const updatedUser = { ...userInfo, wishlist: response.data.wishlist };
  localStorage.setItem("userInfo", JSON.stringify(updatedUser));
  return response.data.wishlist;
  ```

---

### 2. UI Rendering (`WishlistPage.jsx`)
- Displays the user's favorited items.
- Fetches the populated wishlist when mounting, and renders the products in a grid using the `ProductCard` component.
- The wishlist button on the product cards displays active states (e.g. solid red heart) by checking if the item is present in the Redux store's `auth.user.wishlist` array.
