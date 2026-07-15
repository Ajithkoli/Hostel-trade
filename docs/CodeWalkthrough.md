# Code Walkthrough of Key Files

This document provides a technical walkthrough of the core files in the **Hostel Trade** codebase, explaining their purpose, execution flows, and key dependencies.

---

## 1. Backend Codebase Walkthrough

### 1. `backend/server.js`
* **Purpose**: The entry point for the backend application. It configures the Express application, sets up Socket.io, registers routes, and starts the server.
* **Execution Flow**:
  1. Configures security headers using `helmet` and sets up rate limiters.
  2. Sets up CORS configuration.
  3. Registers parsing and cookies middleware.
  4. Runs the NoSQL injection sanitizer.
  5. Connects to MongoDB using `connectDB()`.
  6. Registers routes (`/api/auth`, `/api/products`, `/api/lost-found`, etc.).
  7. Registers Socket.io connection listeners to handle real-time chat operations.
  8. Registers the global `errorHandler` middleware.
  9. Starts the HTTP server on the configured port.
* **Dependencies**: `express`, `socket.io`, `helmet`, `cors`, `cookie-parser`, `dotenv`, `mongoose`.

---

### 2. `backend/controllers/authController.js`
* **Purpose**: Handles authentication operations, including user registration, login, profile updates, password changes, and account deletions.
* **Execution Flow**:
  - `registerUser`: Validates input $\to$ verifies that the email does not exist $\to$ creates a student document (`verified: false`) $\to$ returns a success message.
  - `loginUser`: Retrieves the user and password hash $\to$ validates credentials $\to$ checks if the account is verified $\to$ signs and returns a JWT token.
  - `deleteAccount`: Finds the user's products $\to$ deletes listing images from Cloudinary $\to$ deletes user products from the database $\to$ deletes chat logs and the user document from the database $\to$ clears session cookies.
* **Dependencies**: `User.js`, `Product.js`, `ChatMessage.js`, `jsonwebtoken`, `bcryptjs`, `cloudinary.js`.

---

### 3. `backend/controllers/productController.js`
* **Purpose**: Handles product listings operations, including fetching, creating, updating, and deleting listings.
* **Execution Flow**:
  - `getAllProducts`: Parses query filters (search, price, category, intent, hostel) $\to$ escapes search inputs using `escapeRegex` $\to$ calculates pagination offsets $\to$ returns the list of matching products and metadata.
  - `createProduct`: Receives the files $\to$ uploads images to Cloudinary $\to$ saves the product details and image URLs to MongoDB.
* **Dependencies**: `Product.js`, `User.js`, `Report.js`, `cloudinary.js`, `escapeRegex.js`.

---

### 4. `backend/middleware/authMiddleware.js`
* **Purpose**: Configures route guards to secure API endpoints.
* **Execution Flow**:
  - `protect`: Extracts the token from request headers or cookies $\to$ validates the token using `jwt.verify` $\to$ retrieves the user details (minus password) and attaches them to `req.user` $\to$ calls `next()`.
  - `isAdmin`: Validates if `req.user.role === 'admin'`. Calls `next()` if valid; returns a `403 Forbidden` error if not.
* **Dependencies**: `jsonwebtoken`, `User.js`.

---

### 5. `backend/utils/cloudinary.js`
* **Purpose**: Provides a wrapper around the Cloudinary SDK to handle file uploads and deletions.
* **Execution Flow**:
  - `uploadToCloudinary`: Takes the local file path $\to$ uploads the file to Cloudinary $\to$ deletes the local file from the server disk. Returns the secure URL.
  - `extractPublicId`: Parses the Cloudinary URL to extract the public ID of the resource.
  - `deleteFromCloudinary`: Takes the public ID and deletes the asset from Cloudinary.
* **Dependencies**: `cloudinary`, `fs`.

---

## 2. Frontend Codebase Walkthrough

### 1. `frontend/src/store/authSlice.js`
* **Purpose**: Manages frontend authentication state, configures Axios defaults, and houses async thunks for API calls.
* **Execution Flow**:
  - Configures Axios base URLs and sets `withCredentials: true` to support HTTP cookies.
  - `loginUser`: Sends user credentials to `/api/auth/login` $\to$ stores user details in local storage $\to$ updates the Redux store state.
  - `checkAuth`: Retrieves the user token from local storage and sends it in the headers of a request to `/api/auth/me` to validate the session.
* **Dependencies**: `@reduxjs/toolkit`, `axios`.

---

### 2. `frontend/src/pages/InboxPage.jsx`
* **Purpose**: The main page for real-time messaging, managing socket connections, typing indicators, and read receipts.
* **Execution Flow**:
  1. Initializes the socket connection inside a `useEffect` hook.
  2. Emits `registerUser` with the current user ID.
  3. Listens for events like `newMessage`, `typingStatus`, and `onlineUsersList` to update the chat UI in real-time.
  4. `openConversation`: Joins the socket room for the conversation, fetches message history, and marks unread messages as read.
* **Dependencies**: `socket.io-client`, `react-redux`, `axios`, `react-router-dom`.
