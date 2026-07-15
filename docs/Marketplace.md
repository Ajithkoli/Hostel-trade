# Marketplace Features & Implementation Details

This document explains the technical implementation of the core **Marketplace** features in **Hostel Trade**, including search, sorting, filtering, pagination, and listing lifecycles.

---

## 1. Listing Lifecycles

### 1. Product Creation
- Students fill out the listing form in `AddProduct.jsx` and upload up to 3 images.
- The request is validated by `productValidator` (checks name length, category enum, price, and stock bounds) and processed by `upload.array('images', 3)`.
- If successful, the server uploads the images to Cloudinary and saves the product document with `status: "Available"`.

---

### 2. Status Toggling (Mark Sold)
Sellers can toggle the status of their listings on the dashboard:
- **Available**: Product is visible in marketplace queries.
- **Sold**: Product is hidden from general marketplace feeds, but remains visible on the seller's dashboard.
- **Route**: `PUT /api/products/:id/status` (checks authorization to ensure only the owner can change the status).

---

### 3. Listing Renewal
Sellers can bump older listings back to the top of the feed:
- **Route**: `PUT /api/products/:id/renew`
- **Logic**: Updates the product's `createdAt` timestamp to the current date and time. Since the marketplace defaults to sorting by newest items (`{ createdAt: -1 }`), this action bumps the listing back to the top of the feed.

---

### 4. Product Deletion
Sellers can remove their listings from the platform:
- **Route**: `DELETE /api/products/:id` (checks if the user is the owner or an admin).
- **Cleanup**: Deletes all associated images from Cloudinary before deleting the product document from the database.

---

## 2. Search, Filters, and Sorting (`productController.js`)

Marketplace search and filter options are processed on the backend using Mongoose queries:

```javascript
const { search, category, intent, minPrice, maxPrice, hostel, sort, page = 1, limit = 9 } = req.query;
const query = {};
```

### 1. ReDoS-Safe Search
Search terms are escaped using `escapeRegex` to prevent ReDoS (Regular Expression Denial of Service) attacks, and matched case-insensitively against the product's name and description:
```javascript
if (search) {
  const escapedSearch = escapeRegex(search);
  query.$or = [
    { name: { $regex: escapedSearch, $options: "i" } },
    { description: { $regex: escapedSearch, $options: "i" } }
  ];
}
```

---

### 2. Category Tag Filter
Checks if the category is set and matches the supported category options:
```javascript
if (category && category !== "All") {
  const escapedCategory = escapeRegex(category);
  query.category = { $regex: new RegExp(`^${escapedCategory}$`, "i") };
}
```

---

### 3. Price Bounds
Matches products within a specified price range:
```javascript
if (minPrice || maxPrice) {
  query.price = {};
  if (minPrice) query.price.$gte = Number(minPrice);
  if (maxPrice) query.price.$lte = Number(maxPrice);
}
```

---

### 4. Seller's Hostel Filter
Filters listings by the seller's hostel. It first queries the User collection to find all users registered in the target hostel, and then matches products listed by those users:
```javascript
if (hostel && hostel !== "All") {
  const escapedHostel = escapeRegex(hostel);
  const usersInHostel = await User.find({ hostel: { $regex: escapedHostel, $options: "i" } }).select("_id");
  const userIds = usersInHostel.map(u => u._id);
  query.user = { $in: userIds };
}
```

---

### 5. Sorting Options
Enables sorting by price and date:
- `price_asc`: `{ price: 1 }`
- `price_desc`: `{ price: -1 }`
- `date_desc`: `{ createdAt: -1 }` (default)
- `date_asc`: `{ createdAt: 1 }`

---

## 3. Server-Side Pagination
Pagination is implemented on the server to optimize database queries and load times:

* **Skip Calculation**:
  $$\text{Skip} = (\text{Page Number} - 1) \times \text{Limit}$$
* **Query Execution**:
  ```javascript
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("user")
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));
  ```
* **Metadata Return**:
  Returns the list of products, current page number, total number of matching products, and the total page count:
  $$\text{Pages} = \lceil \text{Total Products} / \text{Limit} \rceil$$
