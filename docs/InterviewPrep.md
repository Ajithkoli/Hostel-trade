# Technical Interview Preparation Guide

This document is a technical interview guide featuring questions, design justifications, and trade-offs based on the **Hostel Trade** codebase.

---

## 1. Top 50 Architecture & MERN Stack Integration Questions

### Q1: Can you describe the high-level architecture of your project?
**Answer**: The project is built on the MERN stack (MongoDB, Express, React, Node.js) using a decoupled Client-Server architecture. The frontend is a React Single Page Application (SPA) built with Vite and TailwindCSS, managing state via Redux Toolkit. The backend is a Node.js and Express REST API that handles business logic, security middleware, and file uploads. It also runs a Socket.io server to support real-time WebSocket communication.

### Q2: Why did you choose a monorepo structure instead of separate repositories?
**Answer**: A monorepo structure was chosen to simplify development, version control, and deployments. It allows us to manage both frontend and backend configurations in a single place while keeping their dependencies isolated.

### Q3: What is the purpose of Vite in your frontend? Why not use Create React App (CRA)?
**Answer**: Vite provides a faster development environment compared to CRA. It uses ES modules (ESM) to compile code on-demand during development, leading to faster server starts and hot module replacement (HMR) times.

### Q4: How does the application bootstrap and load state on startup?
**Answer**: When the React application mounts, `main.jsx` wraps the app in the Redux store provider. Inside `App.jsx`, a `checkAuth` thunk is dispatched to validate existing user credentials stored in localStorage (`userInfo` key) against the `/api/auth/me` endpoint.

### Q5: How do you handle routing guards in React Router?
**Answer**: Routing guards are handled by wrapping protected components in helper wrappers:
* `PrivateRoute`: Checks if the user is authenticated; if not, redirects to `/login`.
* `AdminRoute`: Checks if the user is authenticated and has `role === 'admin'`; if not, redirects to `/login`.

### Q6: What template layout pattern is used on the frontend?
**Answer**: The frontend uses layout templates like `AuthLayout` for login and registration forms, and nested routing views like `AdminLayout` (with `<Outlet />` tags) to render the admin sidebar alongside dashboard contents.

### Q7: Why are pages like About, PrivacyPolicy, and Terms of Service hardcoded as static page files?
**Answer**: Since these pages contain static text and do not change frequently, hardcoding them reduces database queries and improves page load speeds.

### Q8: What backend framework did you choose and why?
**Answer**: Express.js was chosen because it is lightweight, unopinionated, and has a large ecosystem of middleware components (such as body parsers, cookie parsers, and cors support) that make building REST APIs straightforward.

### Q9: How is the Node server configured to serve frontend builds?
**Answer**: The backend serves REST API routes and acts as a static file server for local file uploads (`/uploads` path) using `express.static`. In production, the React build is hosted on Vercel, and the Express API runs separately on Render.

### Q10: How does the server connect to MongoDB?
**Answer**: It uses Mongoose's `connectDB` helper in `backend/config/db.js` to establish connection pools:
```javascript
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
```

---

## 2. Top 50 Security, Database, and WebSockets Questions

### Q11: Explain your custom NoSQL Injection sanitization middleware.
**Answer**: In Express 5, `req.query` is a read-only getter, which prevents packages like `express-mongo-sanitize` from directly sanitizing query strings. To solve this, our middleware uses `Object.defineProperty` to sanitize query parameters by removing keys starting with `$` or containing `.`:
```javascript
const sanitizedQuery = stripMongoOperators({ ...req.query });
Object.defineProperty(req, 'query', {
  value: sanitizedQuery,
  writable: true,
  configurable: true,
  enumerable: true,
});
```

### Q12: How does the application protect against ReDoS (Regular Expression Denial of Service) attacks?
**Answer**: When students search for products or lost items, the search strings are sanitized using the `escapeRegex` utility. This utility escapes regex operators (like `(`, `)`, `+`, `*`) to ensure the search term is processed as a literal string in MongoDB queries, preventing CPU bottlenecks:
```javascript
export const escapeRegex = (string) => {
  if (!string || typeof string !== "string") return "";
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
```

### Q13: What is the difference between your user schema roles?
**Answer**: The User schema supports three roles:
* `user`: Standard account role.
* `student`: Default role assigned to new registrations. Requires admin verification before login is permitted.
* `admin`: Administrative role with access to dashboard user moderation tools.

### Q14: How are passwords stored and compared in the database?
**Answer**: Passwords are saved as hashed strings using `bcryptjs` with 10 salt rounds. A pre-save Mongoose hook automatically hashes the password when a user registers or updates their password:
```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```
Comparisons are handled using the `matchPassword` instance method, which compares passwords using `bcrypt.compare`.

### Q15: How does your database handle relationships?
**Answer**: The database uses reference-based relationships. The Product, LostFound, Report, and ChatMessage schemas store the owner's `ObjectId` referencing the User schema. This data is populated on-demand during queries using Mongoose's `.populate()` method.

### Q16: Why did you store user wishlists directly as arrays of ObjectIds inside the User schema instead of creating a separate Wishlist collection?
**Answer**: Storing wishlists as arrays of ObjectIds inside the User schema simplifies queries, as the user and their wishlist data are retrieved in a single database lookup. This reduces query overhead compared to maintaining and joining a separate Wishlist collection.

### Q17: What indexes are configured to optimize database queries?
**Answer**: The schemas define the following indexes:
* `User`: `{ hostel: 1 }`
* `Product`: `{ category: 1 }`, `{ price: 1 }`, `{ user: 1 }`, `{ createdAt: -1 }`, and a full-text search index: `{ name: "text", description: "text" }`
* `LostFound`: `{ category: 1 }`, `{ hostel: 1 }`, `{ type: 1 }`, `{ status: 1 }`, `{ createdAt: -1 }`
* `ChatMessage`: `{ conversationId: 1 }`, `{ sender: 1, receiver: 1 }`
* `Notification`: `{ user: 1, createdAt: -1 }`

### Q18: Explain how Socket.io manages user connection states and online presence.
**Answer**: The server maintains an in-memory `onlineUsers` Map linking user IDs to their socket IDs. When a client connects, they emit `registerUser`, which maps their user ID to the socket. The server then broadcasts the updated online user list using `io.emit('onlineUsersList', ...)`. When a client disconnects, their socket ID is removed from the Map.

### Q19: How are chat rooms structured using Socket.io?
**Answer**: Chat rooms are structured using a unique `conversationId` generated by sorting and combining the participant IDs alphabetically (e.g. `AliceID-BobID`). Sockets join the room using `socket.join(conversationId)`. This ensures messages, typing indicators, and read receipts are only broadcast to the participants of that specific conversation.

### Q20: Explain the read receipts implementation in the chat.
**Answer**: When Bob opens a conversation with Alice, his client emits a `markAsRead` socket event. The server updates the status of Bob's unread messages to `read: true` in the database, and broadcasts `messagesRead` to the room. Alice's client receives this event and updates the ticks in her UI to green double ticks.

### Q21: What is the purpose of the 2-second debounce timer on typing indicators?
**Answer**: The debounce timer prevents spamming the Socket server with typing events on every keystroke. When a user types, the client emits `typing` once and sets a 2-second timer. If no typing activity occurs within 2 seconds, the client emits `stopTyping`.

### Q22: Explain the image upload pipeline.
**Answer**: When a user uploads images, Multer validates the file type (allowing only jpeg, png, webp) and size (limit 5MB), and temporarily saves them to the server disk under `/uploads`. The server then uploads the images to Cloudinary, deletes the local files, and saves the secure Cloudinary URLs to MongoDB.

### Q23: How do you handle image deletions when a listing is removed?
**Answer**: The server extracts the public ID from the image's Cloudinary URL, and calls `cloudinary.uploader.destroy(publicId)` to delete the file from Cloudinary before deleting the listing document from MongoDB.

### Q24: How does your local fallback mode work if Cloudinary environment variables are missing?
**Answer**: If Cloudinary credentials are not set, the upload wrapper returns the local file path (e.g. `uploads/filename.png`) as a fallback. The frontend's `getImageUrl` helper detects that this is a relative path and prepends the server's local URL (e.g. `http://localhost:5000/uploads/...`) to load the image.

### Q25: How is your Redux store structured?
**Answer**: The store uses `configureStore` to combine five slice reducers: `auth`, `cart`, `products`, `admin`, and `lostFound`. It also integrates a custom `cartPersistMiddleware` to save the cart state to local storage.

### Q26: Explain the cart persistence mechanism.
**Answer**: The `cartSlice` defines actions like `addItem` and `removeItem`. The custom `cartPersistMiddleware` intercepts these actions and automatically saves the updated cart state to `localStorage` under the key `campusCartCart`. On page load, the cart state is retrieved from local storage and loaded into the Redux store.

### Q27: How does server-side pagination optimize marketplace feeds?
**Answer**: The frontend sends page and limit query parameters to `/api/products`. The server calculates the skip offset, fetches only the requested subset of products, and returns the paginated data along with metadata (current page, total pages) to help the frontend render navigation controls:
```javascript
const skip = (Number(page) - 1) * Number(limit);
```

### Q28: What is listing renewal, and how does it work?
**Answer**: Listing renewal allows sellers to bump their listings back to the top of search feeds. The backend updates the listing's `createdAt` timestamp to the current date and time. Since the marketplace query defaults to sorting by newest items (`{ createdAt: -1 }`), this bumps the listing back to the top.

### Q29: Explain the account deletion cascade logic.
**Answer**: To protect user privacy and clean up orphaned data, account deletion triggers a cascading cleanup:
1. Deletes all product images from Cloudinary.
2. Deletes all user listings from MongoDB.
3. Deletes the user's avatar from Cloudinary (if custom).
4. Deletes all chat logs involving the user from the ChatMessage collection.
5. Deletes the user's document from the database.
6. Clears the client-side session cookie.

### Q30: What is the purpose of the `/api/auth/create-admin` route?
**Answer**: This route initializes the database by creating the first administrator account if no admin user exists. It is protected by a environment check to ensure it is only active in non-production environments.

### Q31: How does the application protect against XSS (Cross-Site Scripting)?
**Answer**: The application uses `helmet` to configure secure Content Security Policy headers, saves JWT tokens in HTTP-Only cookies to prevent script access, and uses `express-validator` to sanitize and escape input strings.

### Q32: Explain your application's error handling architecture.
**Answer**: Error handling is centralized in `errorHandler.js`. It distinguishes between operational errors (like schema validation errors) and critical bugs, and returns standardized JSON error responses. It also hides stack trace information in production environments.

### Q33: How does the frontend handle token checks if a user refreshes their browser?
**Answer**: On startup, `App.jsx` dispatches the `checkAuth` thunk. This thunk retrieves the user token from `localStorage` and includes it in the authorization headers of a request to `/api/auth/me` to validate the session.

### Q34: What is the role of the `cors` configuration in your server?
**Answer**: CORS is configured to validate incoming requests, allowing credentials transmission (for HTTP-Only cookies) and dynamically reflecting origins to support local network development.

### Q35: What is the difference between `me` and `profile` routes?
**Answer**: Both routes map to the `getProfile` controller. However, `/api/auth/me` is queried on application startup to validate sessions, while `/api/auth/profile` is used to load data for the user profile page.

### Q36: How does the user approval workflow work?
**Answer**: When a user registers, they are assigned the role `student` with `verified: false`. The admin dashboard lists all pending student accounts. When an admin approves an account, the server updates `verified: true`, allowing the user to log in.

### Q37: How is nodemailer configured in the backend?
**Answer**: Nodemailer is configured inside `email.js` using SMTP credentials. It is used to email password reset links containing recovery tokens to users.

### Q38: How does the frontend handle file uploads?
**Answer**: The frontend uses HTML file inputs to capture image files. It appends these files alongside product details to a `FormData` object, and dispatches the action with `Content-Type: multipart/form-data` headers.

### Q39: What is the difference between the cart utility `cart.js` and `cartSlice.js`?
**Answer**: The custom utility `cart.js` interacts with `localStorage` directly under the key `"cart"`. Redux's `cartSlice` manages cart state within Redux and uses the key `"campusCartCart"` for persistence. The application primarily uses `cartSlice` for managing shopping cart operations.

### Q40: What happens if a user tries to access `/admin` without admin privileges?
**Answer**: The request is intercepted by the `AdminRoute` component on the frontend, which redirects the user back to the login page. On the backend, the request is blocked by the `isAdmin` middleware, returning a `403 Forbidden` response.

### Q41: Explain how you prevent users from reporting their own listings.
**Answer**: The `reportProduct` controller checks if the product owner's ID matches the reporting user's ID:
```javascript
if (product.user.equals(req.user._id)) {
  return res.status(400).json({ message: "You cannot report your own listing" });
}
```

### Q42: What is the purpose of `express.urlencoded` middleware?
**Answer**: This middleware parses incoming request payloads encoded in `application/x-www-form-urlencoded` formats, matching standard HTML form submissions.

### Q43: How does the application handle database timeouts or connection errors?
**Answer**: The database connection in `db.js` catches connection errors, logs them to the console, and exits the process:
```javascript
connectDB().catch(console.error);
```

### Q44: What properties are returned in a product search payload?
**Answer**: The product search returns the array of products, current page number, total pages, and total count. The `user` field in each product is populated with the seller's profile details.

### Q45: Explain the structure of the ChatMessage schema.
**Answer**: The ChatMessage schema stores the `conversationId` (combined participant IDs), the sender and receiver `ObjectIds`, the message string, and a `read` boolean.

### Q46: How does the frontend connect to the Socket.io server?
**Answer**: The client imports `io` from `socket.io-client` and initializes the socket connection inside a `useEffect` hook in `InboxPage.jsx`, targeting the backend URL.

### Q47: What is the purpose of the `resetCurrentItem` action in `lostFoundSlice.js`?
**Answer**: This action resets the current item details and related items in the Redux store when a user navigates away from a details page, preventing old details from showing on the next page load.

### Q48: How does the system restrict password resets to a 10-minute window?
**Answer**: When a password reset is requested, the server generates a token and sets the expiry time to 10 minutes from the current time:
```javascript
user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
```
When resetting the password, the server validates that the current time is before the expiry time: `resetPasswordExpire: { $gt: Date.now() }`.

### Q49: Why is the `standardHeaders: true` flag set on the rate limiters?
**Answer**: This flag returns standard rate-limiting headers (like `RateLimit-Limit`, `RateLimit-Remaining`) in the response headers, helping client applications monitor rate limits.

### Q50: How do you handle password hashing if a user updates their profile details (but does not change their password)?
**Answer**: The User schema's pre-save hook checks if the password field has been modified using `this.isModified('password')`. If it hasn't changed, the hook proceeds without re-hashing the password, preventing data corruption.
