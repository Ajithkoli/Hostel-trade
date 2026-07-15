# REST API Specifications

This document catalogs the REST API endpoints exposed by the **Hostel Trade** backend server. All requests are routed through `/api`.

---

## 1. Authentication Endpoints

### 1. Register Student
* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
* **Purpose**: Register a new student user.
* **Authentication Required**: No.
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@campuscart.com",
    "password": "SecurePassword123",
    "hostel": "Krishna"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Registration successful. Please wait for admin approval.",
    "user": {
      "_id": "60d0fe4f5311236168a109a0",
      "name": "John Doe",
      "email": "johndoe@campuscart.com",
      "hostel": "Krishna",
      "role": "student",
      "verified": false
    }
  }
  ```
* **Error Responses**:
  * `400 Bad Request`: Validation failure (e.g. invalid email, weak password, or user already exists).

---

### 2. Login User
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Purpose**: Authenticate user and issue a JWT session cookie.
* **Authentication Required**: No.
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "johndoe@campuscart.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (200 OK)**:
  * *Sets HTTP-Only Cookie*: `jwt=<token>`
  ```json
  {
    "_id": "60d0fe4f5311236168a109a0",
    "name": "John Doe",
    "email": "johndoe@campuscart.com",
    "hostel": "Krishna",
    "role": "student",
    "verified": true,
    "profilePicture": "uploads/default-avatar.png",
    "wishlist": [],
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Error Responses**:
  * `401 Unauthorized`: Mismatch credentials ("Invalid email or password").
  * `403 Forbidden`: Account verification pending ("Account is pending approval. Please wait for admin verification.").

---

### 3. Logout User
* **Method**: `POST`
* **Endpoint**: `/api/auth/logout`
* **Purpose**: Destroy authentication cookie.
* **Authentication Required**: Yes.
* **Success Response (200 OK)**:
  * *Clears Cookie*: `jwt`
  ```json
  { "message": "Logged out successfully" }
  ```

---

### 4. Get Current Profile
* **Method**: `GET`
* **Endpoint**: `/api/auth/profile` *(also maps to `/api/auth/me`)*
* **Purpose**: Retrieve details of the logged-in student.
* **Authentication Required**: Yes.
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109a0",
    "name": "John Doe",
    "email": "johndoe@campuscart.com",
    "hostel": "Krishna",
    "role": "student",
    "verified": true,
    "profilePicture": "uploads/default-avatar.png",
    "wishlist": []
  }
  ```

---

### 5. Update Profile Details
* **Method**: `PUT`
* **Endpoint**: `/api/auth/profile`
* **Purpose**: Update student name or hostel room location.
* **Authentication Required**: Yes.
* **Request Body**:
  ```json
  {
    "name": "John Doe Updated",
    "hostel": "Vyas"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109a0",
    "name": "John Doe Updated",
    "email": "johndoe@campuscart.com",
    "hostel": "Vyas",
    "role": "student",
    "profilePicture": "uploads/default-avatar.png",
    "verified": true
  }
  ```

---

### 6. Upload Profile Avatar
* **Method**: `PUT`
* **Endpoint**: `/api/auth/avatar`
* **Purpose**: Upload or change profile photo.
* **Authentication Required**: Yes.
* **Headers**: `Content-Type: multipart/form-data`
* **Request Body**: File binary mapped under key `image`.
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109a0",
    "name": "John Doe",
    "email": "johndoe@campuscart.com",
    "hostel": "Krishna",
    "role": "student",
    "profilePicture": "https://res.cloudinary.com/.../hostel-trade/avatar.jpg",
    "verified": true
  }
  ```

---

### 7. Change Password
* **Method**: `PUT`
* **Endpoint**: `/api/auth/password`
* **Purpose**: Set new account password.
* **Authentication Required**: Yes.
* **Request Body**:
  ```json
  {
    "currentPassword": "SecurePassword123",
    "newPassword": "NewSecurePassword456"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  { "success": true, "message": "Password updated successfully" }
  ```
* **Error Responses**:
  * `401 Unauthorized`: Current password verification fails ("Current password is incorrect").

---

### 8. Forgot Password
* **Method**: `POST`
* **Endpoint**: `/api/auth/forgotpassword`
* **Purpose**: Send password reset email token.
* **Authentication Required**: No.
* **Request Body**:
  ```json
  { "email": "johndoe@campuscart.com" }
  ```
* **Success Response (200 OK)**:
  ```json
  { "success": true, "message": "Email sent" }
  ```

---

### 9. Reset Password
* **Method**: `PUT`
* **Endpoint**: `/api/auth/resetpassword/:resettoken`
* **Purpose**: Reset password using recovery token.
* **Authentication Required**: No.
* **Request Body**:
  ```json
  { "password": "NewSecurePassword456" }
  ```
* **Success Response (200 OK)**:
  ```json
  { "success": true, "message": "Password reset successful. You can now log in." }
  ```
* **Error Responses**:
  * `400 Bad Request`: Invalid or expired reset token.

---

### 10. Toggle Product Wishlist
* **Method**: `POST`
* **Endpoint**: `/api/auth/wishlist/:productId`
* **Purpose**: Favorite or unfavorite a product.
* **Authentication Required**: Yes.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product added to wishlist",
    "wishlist": ["60d0ff4f5311236168a109b8"]
  }
  ```

---

### 11. Get Populated Wishlist
* **Method**: `GET`
* **Endpoint**: `/api/auth/wishlist`
* **Purpose**: Retrieve user favorited listings.
* **Authentication Required**: Yes.
* **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d0ff4f5311236168a109b8",
      "name": "Bicycle",
      "price": 1200,
      "user": {
        "name": "Seller Bob",
        "email": "bob@campuscart.com",
        "hostel": "Vyas"
      }
    }
  ]
  ```

---

## 2. Product Endpoints

### 1. Get All Products (Marketplace Browse)
* **Method**: `GET`
* **Endpoint**: `/api/products`
* **Purpose**: Search, filter, and fetch products (excludes "Sold" products by default).
* **Authentication Required**: No.
* **Query Parameters**:
  * `search` (string), `category` (string), `intent` (Buy/Rent), `minPrice`/`maxPrice` (number), `hostel` (string), `sort` (price_asc/price_desc/date_asc/date_desc), `page` (number), `limit` (number).
* **Success Response (200 OK)**:
  ```json
  {
    "products": [ ... ],
    "page": 1,
    "pages": 5,
    "total": 45
  }
  ```

---

### 2. Create Product Listing
* **Method**: `POST`
* **Endpoint**: `/api/products`
* **Purpose**: List new product for buy/rent.
* **Authentication Required**: Yes.
* **Headers**: `Content-Type: multipart/form-data`
* **Request Body**: Name (string), Category (string), Price (number), Stock (number), Intent (Buy/Rent), Description (string). File uploads under key `images` (Max 3 files).
* **Success Response (201 Created)**:
  ```json
  {
    "_id": "60d0ff4f5311236168a109b8",
    "name": "Bicycle",
    "category": "Vehicles",
    "price": 1200,
    "images": [ "https://res.cloudinary.com/.../bicycle.jpg" ],
    "stock": 1,
    "intent": "Buy",
    "user": "60d0fe4f5311236168a109a0",
    "status": "Available"
  }
  ```

---

### 3. Mark Product Status
* **Method**: `PUT`
* **Endpoint**: `/api/products/:id/status`
* **Purpose**: Mark product as Available or Sold.
* **Authentication Required**: Yes.
* **Request Body**:
  ```json
  { "status": "Sold" }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d0ff4f5311236168a109b8",
    "status": "Sold"
  }
  ```

---

### 4. Renew Product Listing
* **Method**: `PUT`
* **Endpoint**: `/api/products/:id/renew`
* **Purpose**: Refresh `createdAt` timestamp to bump the listing back to the top of search queries.
* **Authentication Required**: Yes.
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Listing renewed successfully",
    "product": {
      "_id": "60d0ff4f5311236168a109b8",
      "createdAt": "2026-07-15T19:00:00.000Z"
    }
  }
  ```

---

### 5. Report Listing
* **Method**: `POST`
* **Endpoint**: `/api/products/:id/report`
* **Purpose**: Flag listing for admin review.
* **Authentication Required**: Yes.
* **Request Body**:
  ```json
  { "reason": "Prohibited listing content" }
  ```
* **Success Response (201 Created)**:
  ```json
  { "message": "Report submitted successfully" }
  ```

---

## 3. Lost & Found Endpoints

### 1. Get All Lost & Found Items
* **Method**: `GET`
* **Endpoint**: `/api/lost-found`
* **Query Parameters**: `search`, `type` (Lost/Found), `category`, `hostel`, `status` (Open/Claimed/Closed), `sort`, `page`, `limit`.
* **Success Response (200 OK)**:
  ```json
  {
    "items": [ ... ],
    "page": 1,
    "pages": 2,
    "total": 12
  }
  ```

---

### 2. Create Lost/Found Entry
* **Method**: `POST`
* **Endpoint**: `/api/lost-found`
* **Headers**: `Content-Type: multipart/form-data`
* **Request Body**: Title (string), Description (string), Type (Lost/Found), Category (string), Location (string), Hostel (string), DateLostOrFound (date), ContactPreference (Chat/Email/Phone), Reward (optional). File uploads under key `images` (Max 3 files).
* **Success Response (201 Created)**:
  ```json
  {
    "_id": "60d0ff8f5311236168a109cf",
    "title": "Keys Lost",
    "status": "Open"
  }
  ```

---

## 4. Admin Management Endpoints

### 1. Fetch Students List
* **Method**: `GET`
* **Endpoint**: `/api/users` *(routed inside adminRoutes.js)*
* **Purpose**: Retrieve student list (excludes users with `role: "admin"`).
* **Authentication Required**: Yes (Admin role).
* **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d0fe4f5311236168a109a0",
      "name": "John Doe",
      "email": "johndoe@campuscart.com",
      "verified": false,
      "role": "student"
    }
  ]
  ```

---

### 2. Approve Student (Verify)
* **Method**: `PATCH`
* **Endpoint**: `/api/users/:id/verify`
* **Purpose**: Set `verified: true` to grant system login access.
* **Authentication Required**: Yes (Admin role).
* **Success Response (200 OK)**:
  ```json
  {
    "message": "User verified successfully",
    "user": {
      "_id": "60d0fe4f5311236168a109a0",
      "verified": true
    }
  }
  ```

---

### 3. Reject/Delete Student
* **Method**: `DELETE`
* **Endpoint**: `/api/users/:id`
* **Purpose**: Delete student account from system.
* **Authentication Required**: Yes (Admin role).
* **Success Response (200 OK)**:
  ```json
  { "message": "User rejected and removed" }
  ```

---

## 5. Chat & Conversations

### 1. Get User Conversations
* **Method**: `GET`
* **Endpoint**: `/api/conversations/:userId`
* **Purpose**: Fetch active chats with participant identities.
* **Authentication Required**: Yes.
* **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d0fe4f5311236168a109a0-60d0ff4f5311236168a109b8",
      "participants": [
        { "_id": "60d0fe4f5311236168a109a0", "name": "Alice" },
        { "_id": "60d0ff4f5311236168a109b8", "name": "Bob" }
      ],
      "unreadCount": 0
    }
  ]
  ```

---

### 2. Get Chat Messages
* **Method**: `GET`
* **Endpoint**: `/api/chat/conversation/:conversationId`
* **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60d1004f5311236168a10a01",
      "conversationId": "60d0fe4f5311236168a109a0-60d0ff4f5311236168a109b8",
      "sender": { "_id": "60d0fe4f5311236168a109a0", "name": "Alice" },
      "message": "Hi, is this bicycle available?",
      "read": true
    }
  ]
  ```
