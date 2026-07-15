# Technical Interview Prep Guide - Part 2

This document continues the technical interview preparation guide, containing questions 51 to 100 covering database operations, real-time sync, security edge cases, performance trade-offs, and deployment configurations.

---

## 3. Top 51-100 Advanced Architecture, Trade-offs & Operations Questions

### Q51: How does the application handle WebSocket reconnection when connection is lost?
**Answer**: Socket.io-client handles reconnection automatically. It listens to network status updates and attempts to reconnect using an exponential backoff strategy. Once the connection is re-established, the client re-emits `registerUser` with the current user ID to map their online presence again.

### Q52: What is a potential issue with using sorted user IDs as conversation IDs?
**Answer**: Sorting and combining user IDs alphabetically (e.g. `AliceID-BobID`) works well for direct messages. However, this pattern does not scale if we decide to support group chats (e.g. 3 or more participants) in the future. In that case, we would need to generate unique UUIDs and maintain a participants list array in a separate Conversations collection.

### Q53: Explain the database design trade-offs of embedding the wishlist array inside the User document.
**Answer**:
* **Pros**: Simple queries. We can retrieve the user's wishlist details in a single query by using Mongoose's `.populate()` method, without needing to maintain and join a separate collection.
* **Cons**: If a wishlist grows very large, the User document size grows. MongoDB has a document limit of 16MB. Since we are only storing ObjectIds, this is unlikely to exceed the limit, but it remains a consideration for large-scale applications.

### Q54: How are notifications handled when a user is offline?
**Answer**: Notifications are saved to the Notification collection in MongoDB with `read: false`. When the user logs in or refreshes the page, the frontend fetches their notification history. Sockets are used to push notifications in real-time only if the user is currently online.

### Q55: What are the trade-offs of using `Multer`'s disk storage instead of memory storage for file uploads?
**Answer**:
* **Disk Storage**: Temporarily saves files to the server's disk buffer. This prevents high memory usage on the server when handling large file uploads, but requires disk write permissions and cleanup routines to delete files after upload.
* **Memory Storage**: Keeps files in RAM. This is faster because it avoids disk writes, but can lead to memory exhaustion if multiple users upload large files simultaneously.

### Q56: Why does `authController.js` delete all user products when an account is deleted?
**Answer**: This prevents orphaned product listings from remaining in the database, ensuring database cleanliness and avoiding errors where listings refer to users that no longer exist.

### Q57: How do you handle file upload errors gracefully without exposing system details?
**Answer**: The backend upload middleware catches errors (like size limit violations or invalid file types) and forwards them to the global `errorHandler`. The handler returns a formatted JSON response to the user and logs the stack trace only in development mode.

### Q58: Why did you choose DaisyUI on top of TailwindCSS?
**Answer**: DaisyUI provides pre-designed components (like buttons, modals, and cards) as Tailwind utility classes. This speeds up UI development while preserving Tailwind's styling flexibility.

### Q59: Explain why the route `/forgot-password` in `Login.jsx` is not connected on the frontend.
**Answer**: While the backend implements the Forgot Password and Reset Password APIs, the frontend route is not mapped in `App.jsx`. This is an incomplete feature implementation that we should note in our documentation.

### Q60: How does the server prevent cross-site request forgery (CSRF)?
**Answer**: We configure the session cookie with `sameSite: 'lax'` to prevent it from being sent on cross-site subrequests. Additionally, requests require an `Authorization: Bearer <token>` header, which cannot be accessed by scripts running on external domains.

### Q61: What are the trade-offs of using the React-Toastify package?
**Answer**:
* **Pros**: Provides pre-styled notification banners out-of-the-box, simplifying user feedback notifications.
* **Cons**: Adds to the frontend bundle size. However, this is a minor trade-off given the improved user experience.

### Q62: Why does the system use `cors` dynamic reflection instead of hardcoding the production domain?
**Answer**: Hardcoding the production domain makes local testing difficult. Dynamic reflection allows us to easily test the application across local network devices (like testing mobile layouts on phone browsers connected to the same Wi-Fi network).

### Q63: Explain how Mongoose manages updated timestamps automatically.
**Answer**: Schemas are configured with the `timestamps: true` option:
```javascript
{ timestamps: true }
```
This tells Mongoose to automatically set `createdAt` when a document is created, and update `updatedAt` when the document is modified.

### Q64: What is the risk of using `bcryptjs` instead of native C++ `bcrypt`?
**Answer**: `bcryptjs` is a pure JavaScript implementation. It is slower than the native C++ version, but is more portable because it does not require native compilation tools during deployment, making it easier to deploy on serverless platforms.

### Q65: How do you prevent race conditions if Bob and Alice buy the last item at the same time?
**Answer**: Currently, Hostel Trade is a peer-to-peer catalog, so transactions are coordinated between users. If we implement direct checkouts in the future, we would need to use MongoDB transactions or atomic updates (e.g. `{ $gt: 0 }` filters) to decrement stock safely:
```javascript
Product.updateOne({ _id: productId, stock: { $gt: 0 } }, { $inc: { stock: -1 } })
```

### Q66: Explain the difference between React's `useEffect` and `useCallback` hooks.
**Answer**:
* `useEffect`: Runs side effects (like API requests or event listener registrations) when dependency states change.
* `useCallback`: Memoizes functions to prevent them from being re-created on every render, optimizing performance when passing callbacks to child components.

### Q67: What does `axios.defaults.withCredentials = true` do?
**Answer**: This tells Axios to automatically include credentials (like cookies and authorization headers) in cross-origin requests, which is necessary for backend cookie verification.

### Q68: How do you handle environment variables on Vercel?
**Answer**: Environment variables are configured in the Vercel project dashboard. This keeps keys secure, as they are injected at build time and are not committed to our Git repository.

### Q69: Explain why the `/api/users` route excludes admin accounts.
**Answer**: The admin user list query filters for `{ role: 'student' }` to prevent admins from modifying other administrator accounts.

### Q70: What is the difference between `cookie-parser` and `express.json`?
**Answer**:
* `cookie-parser`: Parses the `Cookie` request header and populates `req.cookies` with the cookie data.
* `express.json`: Parses incoming request payloads with JSON format and populates `req.body`.

### Q71: What is the purpose of `express-async-handler`?
**Answer**: It simplifies error handling in async Express routes by catching errors and forwarding them to the global error handler automatically, eliminating the need for `try-catch` blocks in every route.

### Q72: How are related posts retrieved on the details page?
**Answer**: The server queries for posts matching the same category or hostel, excluding the currently viewed post, and limits the result to 3:
```javascript
const relatedItems = await LostFound.find({
  _id: { $ne: item._id },
  $or: [{ category: item.category }, { hostel: item.hostel }],
}).limit(3);
```

### Q73: Why are MongoDB connection strings kept secure in `.env`?
**Answer**: The connection string contains cluster access credentials. If exposed, attackers could read or modify the database.

### Q74: Explain the difference between a Mongoose Schema and a Mongoose Model.
**Answer**:
* **Schema**: Defines the structure, fields, validation constraints, and indexes of a document.
* **Model**: A compiled wrapper around the schema that provides methods (like `find()`, `create()`) to query the database.

### Q75: How does the application prevent duplicate reports from the same user?
**Answer**: The `reportProduct` controller queries for existing reports from the user before saving a new one:
```javascript
const existingReport = await Report.findOne({ reporter: req.user._id, product: product._id });
if (existingReport) {
  return res.status(400).json({ message: "You have already reported this listing" });
}
```

### Q76: Explain the difference between `localStorage` and Redux state.
**Answer**:
* `localStorage`: Persistent storage in the user's browser that survives page refreshes and browser restarts.
* `Redux`: In-memory state management. It is faster but resets when the page is refreshed, unless synchronized with local storage.

### Q77: Why does the application use `react-icons`?
**Answer**: It compiles popular icon libraries (like FontAwesome, Heroicons) into lightweight SVG components, reducing asset sizes.

### Q78: Explain the difference between `HTTP` and `WebSockets`.
**Answer**:
* **HTTP**: A unidirectional request-response protocol. The client must request data from the server.
* **WebSockets**: A persistent, bidirectional protocol that allows both the client and server to send data instantly.

### Q79: What is the purpose of the `User.js` index on `{ hostel: 1 }`?
**Answer**: This index optimizes marketplace and lost-found search queries that filter listings by the seller's hostel.

### Q80: How does the application handle invalid route requests?
**Answer**: The React Router fallback route catches unmatched paths and displays a 404 page or redirects the user to the home page.

### Q81: What is the role of `nodemailer`?
**Answer**: It connects to SMTP servers to deliver emails (like password reset links) to users.

### Q82: What is the default port for Express?
**Answer**: The server defaults to port `5000` unless overridden by the `PORT` environment variable.

### Q83: Why are chat messages populated with sender/receiver details?
**Answer**: The ChatMessage schema only stores the user `ObjectIds`. We populate these fields to display user names and profile pictures in the chat UI.

### Q84: How do you configure a Vercel routing fallback?
**Answer**: We configure the `vercel.json` file to route all requests to `index.html`, allowing React Router to handle client-side routing.

### Q85: What are the trade-offs of using MongoDB over PostgreSQL?
**Answer**:
* **MongoDB**: A document database that supports flexible schemas, making it easy to store unstructured data like chat logs.
* **PostgreSQL**: A relational database that supports ACID transactions and complex joins, but has less schema flexibility.

### Q86: Explain the role of the `standardHeaders` rate-limiting configuration.
**Answer**: This flag returns standard rate-limiting headers (like `RateLimit-Limit`, `RateLimit-Remaining`) in the response headers, helping client applications monitor rate limits.

### Q87: Explain the pre-save hook in `User.js`.
**Answer**: It intercepts user document saves and hashes the password if the password field has been modified, securing credentials before they are saved to the database.

### Q88: Why are REST APIs used alongside WebSockets?
**Answer**: REST APIs are used for standard operations (like registering, listing products, and fetching history), while WebSockets are used for real-time interactions (like instant messages and typing indicators).

### Q89: What is the difference between `save` and `create` in Mongoose?
**Answer**:
* `create`: A Mongoose method that initializes and saves a document in a single call.
* `save`: An instance method used to save changes made to an existing document.

### Q90: Why does the system run on port 5173 on the frontend?
**Answer**: Port `5173` is the default port used by Vite during local development.

### Q91: Explain the purpose of `express-mongo-sanitize`.
**Answer**: It is a middleware used to strip MongoDB operator keys (like `$`, `.`) from request inputs to prevent NoSQL Injection attacks.

### Q92: What does `Object.values(err.errors).map(val => val.message)` do?
**Answer**: It extracts and formats Mongoose validation errors into a readable string to return to the client.

### Q93: Why does `authController` verify token expiry times?
**Answer**: To ensure password reset links expire after 10 minutes, protecting against unauthorized access if a link is intercepted.

### Q94: Explain the difference between `JWT` and session cookie authentication.
**Answer**:
* **JWT**: A stateless token containing user data that is validated cryptographically by the server.
* **Session Cookies**: A stateful model where the server checks a session ID against database records on every request.

### Q95: Why does the application use `morgan` middleware?
**Answer**: `morgan` is an HTTP request logger middleware that logs request details (like method, status, response time) to the console, helping developers debug API requests.

### Q96: What is a wildcard DNS record, and why is it useful?
**Answer**: A wildcard DNS record routes all subdomains to a single IP address, which is useful when hosting multi-tenant platforms.

### Q97: What is the maximum file size limit for Multer?
**Answer**: The server limits uploads to `5MB` per file to prevent disk space exhaustion.

### Q98: Why are React custom hooks used?
**Answer**: Custom hooks extract reusable UI logic (like data fetching or socket listeners) into standalone functions, reducing code duplication.

### Q99: Explain the role of `standardHeaders` in rate limiters.
**Answer**: This flag returns standard rate-limiting headers (like `RateLimit-Limit`, `RateLimit-Remaining`) in the response headers, helping client applications monitor rate limits.

### Q100: How do you test WebSocket connections?
**Answer**: We can write automated integration tests using `socket.io-client` mock connections, or verify event flows manually by opening multiple browser tabs.
