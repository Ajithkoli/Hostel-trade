# Performance Optimization Strategies

This document explains the performance optimizations, query tuning, and asset delivery strategies implemented in **Hostel Trade**.

---

## 1. Database Indexing & Query Tuning

To maintain low query latencies as the database grows, Mongoose schemas have compound and single-field indexes configured for common query filters:

### Index Configurations
- **`User.js`**:
  * `{ hostel: 1 }`: Speeds up marketplace hostel filtering queries.
- **`Product.js`**:
  * `{ category: 1 }`: Speeds up category filter lookups.
  * `{ price: 1 }`: Optimizes price sorting queries.
  * `{ user: 1 }`: Speeds up user dashboard listing lookups.
  * `{ createdAt: -1 }`: Optimizes default sorting queries (newest items first).
  * `{ name: "text", description: "text" }`: Full-text search index for keyword searches.
- **`LostFound.js`**:
  * `{ category: 1 }`, `{ hostel: 1 }`, `{ type: 1 }`, `{ status: 1 }`, `{ createdAt: -1 }`.
- **`ChatMessage.js`**:
  * `{ conversationId: 1 }`: Optimizes room messages history retrieval queries.
- **`Notification.js`**:
  * `{ user: 1, createdAt: -1 }`: Optimizes user notification feed lookups.

### Query Projection & Populates
To optimize database queries, we only fetch the necessary fields:
- **Excluding Sensitive Fields**: The user password field is excluded by default using `select: false` in the schema.
- **Selective Populates**: When populating user details, we only fetch the necessary fields instead of the entire user document:
  ```javascript
  // lostFoundController.js
  .populate("createdBy", "name email hostel profilePicture")
  ```

---

## 2. Server-Side Pagination

To prevent database and network bottlenecks, product searches and feeds are paginated on the server using `skip` and `limit` logic:
- The backend defaults to a limit of 9 items per page.
- Using a skip-limit approach ensures the server only queries and returns the requested page of data:
  ```javascript
  const skip = (Number(page) - 1) * Number(limit);
  const products = await Product.find(query)
    .populate("user")
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));
  ```
This prevents the server from returning large datasets all at once, improving response times.

---

## 3. Frontend Optimizations

### 1. Keystroke Debouncing
To prevent spamming the server with Socket events, the chat input uses a 2-second timeout debounce to manage typing indicator states:
```javascript
const handleInputChange = (e) => {
  setMsgInput(e.target.value);
  if (!activeConv || !socketRef.current) return;
  
  socketRef.current.emit("typing", {
    conversationId: activeConv.conversationId,
    userId: user._id,
  });
  
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    socketRef.current?.emit("stopTyping", {
      conversationId: activeConv.conversationId,
      userId: user._id,
    });
  }, 2000);
};
```

---

### 2. Component Memoization
We use `useCallback` to memoize functions like `openConversation` in `InboxPage.jsx`. This prevents child components from re-rendering unnecessarily when states change:
```javascript
const openConversation = useCallback(
  async (otherUser, conversationId) => {
    // ... logic
  },
  [user._id]
);
```

---

### 3. Redux Toolkit Caching
The application uses Redux Toolkit to cache states like products, lost/found items, and admin lists. This allows users to navigate between pages without re-fetching data unless a state change occurs.

---

## 4. Image Hosting & Delivery Optimizations

Hostel Trade offloads image processing to Cloudinary's CDN (Content Delivery Network):
* **Format Optimization**: Cloudinary automatically serves images in the most optimal format (e.g. converting images to WebP for modern browsers).
* **Responsive Scaling**: The frontend displays image thumbnails in grid cards and loads full-resolution images only on detail views. This reduces initial page load times and bandwidth consumption.
* **CDNs**: Serves images from Cloudinary edge locations close to the user, reducing latency.
