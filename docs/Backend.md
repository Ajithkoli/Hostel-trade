# Backend Architecture & Code Documentation

This document describes the design, routing, middlewares, controllers, database models, utilities, and configuration parameters of the Node.js/Express backend for **Hostel Trade**.

---

## 1. Entry Point (`backend/server.js`)
The server initialization file sets up:
- **Express App Configuration**: JSON body parsing, URL-encoded parsing, static files serving from the `uploads/` directory.
- **Security Middlewares**:
  - `helmet`: Sets Content Security Policy (CSP) enabling WebSockets (`ws:`, `wss:`) and Cloudinary image sources (`https://res.cloudinary.com`).
  - `cors`: Handles cross-origin requests with credentials support, dynamically reflecting incoming origins to ease local/network development.
  - NoSQL Injection Sanitization: Custom middleware built to sanitise Express 5 requests by stripping properties prefixing with `$` or containing `.`. Special handling is implemented for `req.query` (read-only getter in Express 5) using `Object.defineProperty`.
- **Rate Limiters**:
  - `apiLimiter`: 300 requests per 15 minutes for general `/api` paths.
  - `authLimiter`: Max 15 attempts per 15 minutes on login, register, forgot/reset password.
  - `productCreationLimiter`: Max 15 listing creations per hour.
  - `chatLimiter`: Max 60 messages/requests per minute.
- **HTTP Server wrapping & Socket.io**: Dynamic CORS reflection for Socket handshake, event listener registration.
- **Error Handling**: Custom `errorHandler` registered at the very end of the middleware chain.

---

## 2. Environment Variables (`.env`)
The backend depends on the following key environment variables:
- `PORT`: Network port for backend server execution (default: `5000`).
- `MONGO_URI`: MongoDB connection string (Atlas or local replica set).
- `JWT_SECRET`: Secret key for signing JSON Web Tokens.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials for storing uploaded image assets.
- `SMPT_HOST`, `SMPT_PORT`, `SMPT_USER`, `SMPT_PASSWORD`: SMTP configurations for password reset transactional emails.
- `NODE_ENV`: Runtime mode (`development` or `production`).

---

## 3. Database Connection (`backend/config/db.js`)
Handles MongoDB connection using Mongoose ODM:
- Uses `mongoose.connect(process.env.MONGO_URI)`.
- Logs successful connection host to console.
- In case of failure, logs error and exits process with code `1`.

---

## 4. Middlewares (`backend/middleware/`)

### `authMiddleware.js`
- **`protect`**: Extract token from `Authorization` header (`Bearer <token>`) or `jwt` HTTP-only cookie. Verifies the token using `jwt.verify`. Adds user document (minus password) to `req.user`. Returns `401 Unauthorized` if validation fails or token is missing.
- **`isAdmin`**: Validates whether `req.user.role === 'admin'`. Returns `403 Forbidden` if validation fails.

### `upload.js`
- Powered by `multer`. Configures temporary file storage on the server disk under `uploads/` directory with UUIDv4 filenames.
- Filters files to allow only specific image formats (`jpeg`, `jpg`, `png`, `webp`).
- Restricts files to a maximum size of `5MB` and a maximum limit of `3` files per request.

### `validationMiddleware.js`
- Powered by `express-validator`. Defines schema checking arrays for:
  - `registerValidator`: Ensures names are 2-50 chars, emails are valid and normalized, password length is at least 8 with 1 uppercase, 1 lowercase, and 1 digit.
  - `loginValidator`, `forgotPasswordValidator`, `resetPasswordValidator`, `changePasswordValidator`, `profileUpdateValidator`.
  - `productValidator`: Validates fields like category, stock (>= 0), price (>= 0), intent (Buy/Rent).
  - `lostFoundValidator`: Validates lost/found fields, ISO8601 date format, and contact preference.
  - `chatMessageValidator`: Validates message size (<= 2000) and receiver's MongoDB ObjectId format.
- Uses `handleValidationErrors` helper to format errors into standard JSON outputs.

### `errorMiddleware.js`
- Differentiates operational warnings from critical bugs.
- Normalizes Database and JWT library errors:
  - `CastError`: Resolves to a `404 Not Found`.
  - `ValidationError`: Combines schema validation errors into a readable string.
  - Duplicate key `11000` error: Maps to a `400 Bad Request` identifying the duplicated field.
  - `JsonWebTokenError` / `TokenExpiredError`: Maps to a `401 Unauthorized`.
- Hides stack trace information in production environments.

---

## 5. Controllers & Routes (`backend/controllers/` & `backend/routes/`)

| Route Path | Method | Middleware | Controller Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| **/api/auth/register** | `POST` | `registerValidator` | `registerUser` | Registers new student (verified: false) |
| **/api/auth/login** | `POST` | `loginValidator` | `loginUser` | Validates credentials, sets HTTP-only cookie, returns token |
| **/api/auth/logout** | `POST` | `protect` | `logoutUser` | Clears `jwt` cookie |
| **/api/auth/me** | `GET` | `protect` | `getProfile` | Retrieves current profile |
| **/api/auth/profile** | `GET` | `protect` | `getProfile` | Retrieves profile details |
| **/api/auth/profile** | `PUT` | `protect`, `profileUpdateValidator` | `updateProfile` | Updates profile name, hostel |
| **/api/auth/avatar** | `PUT` | `protect`, `upload.single('image')` | `updateAvatar` | Uploads profile picture, cleans old Cloudinary asset |
| **/api/auth/password** | `PUT` | `protect`, `changePasswordValidator` | `changePassword` | Verifies current password and sets new password |
| **/api/auth/account** | `DELETE` | `protect` | `deleteAccount` | Deletes user, products, chats, and Cloudinary uploads |
| **/api/auth/forgotpassword** | `POST` | `forgotPasswordValidator` | `forgotPassword` | Generates reset token and emails frontend reset URL |
| **/api/auth/resetpassword/:resettoken** | `PUT` | `resetPasswordValidator` | `resetPassword` | Resets password using valid unexpired token |
| **/api/auth/wishlist/:productId** | `POST` | `protect`, `paramIdValidator` | `toggleWishlist` | Adds/Removes product to user wishlist array |
| **/api/auth/wishlist** | `GET` | `protect` | `getWishlist` | Gets populated wishlist items |
| **/api/products** | `GET` | *(None)* | `getAllProducts` | Searches, filters, page products (excludes sold items) |
| **/api/products/:id** | `GET` | *(None)* | `getProductById` | Retrives single product details with seller info |
| **/api/products** | `POST` | `protect`, `upload.array('images', 3)` | `createProduct` | Saves new product listing with uploaded images |
| **/api/products/:id** | `PUT` | `protect`, `upload.array('images', 3)` | `updateProduct` | Updates product details/images (checks owner authorization) |
| **/api/products/:id** | `DELETE` | `protect` | `deleteProduct` | Deletes product (checks owner or admin authorization) |
| **/api/products/mypoints** *(myposts)* | `GET` | `protect` | `getUserProducts` | Retrieves products belonging to logged-in user |
| **/api/products/:id/status** | `PUT` | `protect` | `updateProductStatus` | Marks product as "Available" or "Sold" |
| **/api/products/:id/renew** | `PUT` | `protect` | `renewProduct` | Refreshes `createdAt` timestamp to bump listing to top |
| **/api/products/:id/report** | `POST` | `protect` | `reportProduct` | Submits a report for a product listing |
| **/api/lost-found** | `GET` | *(None)* | `getAllLostFound` | Lists lost/found posts with type, location filters |
| **/api/lost-found/:id** | `GET` | *(None)* | `getLostFoundById` | Retrieves post details and 3 related posts |
| **/api/lost-found** | `POST` | `protect`, `upload.array('images', 3)` | `createLostFound` | Creates lost/found post with optional reward/contact |
| **/api/lost-found/:id** | `PUT` | `protect`, `upload.array('images', 3)` | `updateLostFound` | Updates post details (checks owner authorization) |
| **/api/lost-found/:id** | `DELETE` | `protect` | `deleteLostFound` | Deletes post (checks owner authorization) |
| **/api/lost-found/myposts** | `GET` | `protect` | `getUserLostFound` | Lists posts created by current user |
| **/api/users** | `GET` | `protect`, `isAdmin` | `getAllUsers` | Admin: Lists all student users |
| **/api/users/:id/verify** | `PATCH` | `protect`, `isAdmin` | `approveUser` | Admin: Verifies student account |
| **/api/users/:id** | `DELETE` | `protect`, `isAdmin` | `rejectUser` | Admin: Rejects/Deletes user |
| **/api/users/:id** | `PUT` | `protect`, `isAdmin` | `updateUser` | Admin: Updates student fields (name, email, hostel) |
| **/api/users/:id/make-admin** | `PATCH` | `protect`, `isAdmin` | `roleChange` | Admin: Toggles user role between admin and student |
| **/api/chat/conversation/:conversationId** | `GET` | `protect` | `getConversationMessages` | Retrieves message history for conversation room |
| **/api/conversations/:userId** | `GET` | `protect` | `getConversationsList` | Retrieves user's conversations with latest message |
| **/api/chat/conversation/:conversationId/read** | `PATCH` | `protect` | `markConversationAsRead` | Marks all incoming messages in room as read |
| **/api/notifications** | `GET` | `protect` | `getNotifications` | Retrieves last 50 notifications for user |
| **/api/notifications/:id/read** | `PATCH` | `protect` | `markNotificationRead` | Marks single notification as read |
| **/api/notifications/read-all** | `PATCH` | `protect` | `markAllNotificationsRead` | Marks all notifications as read |

---

## 6. Utilities (`backend/utils/`)

### `cloudinary.js`
- Integrates with the Cloudinary SDK.
- `uploadToCloudinary`: Uploads a file, cleans it up from the local folder, and returns the secure URL. Fallbacks gracefully to returning the local path if Cloudinary env vars are missing.
- `extractPublicId`: Parses Cloudinary secure URLs (e.g. `https://res.cloudinary.com/cloudname/image/upload/v1234/folder/publicid.jpg`) to retrieve the resource public ID.
- `deleteFromCloudinary`: Destroys the asset matching the public ID.

### `email.js`
- Sets up a `nodemailer` SMTP transport using Gmail/SMTP variables.
- Sends passwords reset URLs packaged in styled HTML emails containing a custom reset link button.

### `escapeRegex.js`
- Protects the database search query compiler against ReDoS (Regular Expression Denial of Service) by escaping regex special characters from text searches: `[-\/\\^$*+?.()|[\]{}]`.
