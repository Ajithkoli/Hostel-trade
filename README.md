# 🛍️ CampusCart – Hostel Trade Platform

> [!IMPORTANT]
> **Complete Technical Documentation**: We have generated a comprehensive suite of professional technical documentation. You can access the **[Technical Documentation Directory](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/README.md)** or read the specific documents inside the [docs/](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/) folder.

**CampusCart** (formerly Hostel Trade) is a production-grade, placement-ready full-stack MERN marketplace designed for RVCE campus residents. Students can list, buy, rent, and trade second-hand items (electronics, books, vehicles, utensils) securely.

The application features advanced search indexes, debounced filters, a real-time messaging engine built on Socket.IO (with typing indicators, read receipts, and online trackers), structured notification queues, and Cloudinary-integrated media upload pipelines.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Redux Toolkit, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express.js (REST APIs, Async Error Middleware)
- **Real-Time Integration**: Socket.IO
- **Database**: MongoDB (with Mongoose modeling & indexing)
- **Authentication**: Cookie & Bearer Header-based JWT Authentication
- **Media Upload**: Multiprocessing Multer & Cloudinary Storage SDK
- **Security Protocols**: Helmet headers, Express Rate Limiter, NoSQL MongoDB sanitizers, bcryptjs hashing

---

## 📂 Project Structure

```text
/backend
  ├── config/          # DB connection configuration
  ├── controllers/     # REST business logic controllers (auth, chat, products, notifications)
  ├── middleware/      # Security guards, auth decoders, and multer image parsers
  ├── models/          # Optimized Mongoose Schemas (User, Product, ChatMessage, Notification, Report)
  ├── routes/          # Mounted Express API routes
  └── utils/           # Nodemailer transport, token generators, and Cloudinary services
/frontend
  ├── src/
  │    ├── Admin/      # Administrative moderation panels and analytics views
  │    ├── components/ # Shared UI blocks (Cards, Sidebars, Navbars, Chat boxes)
  │    ├── pages/      # Views (Marketplace, Profile, Wishlist, Authentication, Inbox)
  │    ├── store/      # Redux slices (Auth state, Product collections, Cart caches)
  │    └── utils/      # Client-side helper scripts (Image URL formatting, Cart local storage)
```

---

## 🚀 Key Production Features

### 1. Database Indexing & Optimizations
- **Text Search Index**: Compound Text index on `{ name: "text", description: "text" }` inside the `Product` schema to allow high-speed marketplace searches.
- **Fast Filtering Indexes**: B-Tree single-field indices on `category`, `price`, `user`, `hostel`, and `createdAt` fields to speed up queries.
- **Automatic Cleanup**: Cascade-deletes all associated listings, chats, and Cloudinary media items when a user profile is deleted.

### 2. Sockets Real-Time Chat Engine
- **Online Registry**: Maps and tracks active user sessions across multiple device tabs.
- **Typing Indicators**: Real-time animation feedback indicating when users are typing in text inputs.
- **Read Receipts**: Socket-driven read receipts rendering double blue checkmarks (`✓✓`) on messages read.

### 3. Comprehensive Filtering & Search
- **Debounced Inputs**: Delay search dispatches by 400ms to preserve server bandwidth.
- **URL Synchronization**: Automatically reflects active searches, price brackets, intents, sorting orders, and page indexes directly inside browser search query parameters.
- **Server-Side Pagination**: Clean pagination bar indicating items count and page distributions.

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)
Create a `.env` file inside the `/backend` folder:
```env
PORT=5000
NODE_ENV=development
DB_URL=mongodb://127.0.0.1:27017/hostel_hub
JWT_SECRET=your_secure_jwt_secret_key

# Nodemailer SMTP Configuration
SMPT_HOST=smtp.gmail.com
SMPT_PORT=465
SMPT_USER=your_gmail_address
SMPT_PASSWORD=your_app_specific_password

# Cloudinary API Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Setup (`frontend/.env`)
Create a `.env` file inside the `/frontend` folder:
```env
VITE_SERVER_URL=http://localhost:5000
```

---

## 🧑‍💻 Getting Started

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/campuscart.git
   cd campuscart
   ```

2. **Launch Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Launch Frontend Client**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Visit**: Open `http://localhost:5173` in your browser.

---

## 📌 API Reference

### User & Auth (`/api/auth`)
- `POST /register` - Registers a student account (pending verification).
- `POST /login` - Logs in and drops a secure cookie containing the JWT.
- `POST /logout` - Signs out and wipes JWT tokens.
- `GET /me` / `GET /profile` - Fetches the authenticated user profile.
- `PUT /profile` - Updates user `name` and `hostel` details.
- `PUT /avatar` - Uploads profile avatar to Cloudinary.
- `PUT /password` - Updates user password.
- `POST /forgotpassword` - Generates reset tokens and dispatches nodemailer link.
- `PUT /resetpassword/:resettoken` - Accepts token and updates password.
- `DELETE /account` - Deletes account and associated files.

### Marketplace & Products (`/api/products`)
- `GET /` - Fetches products filtered by search queries, price, hostel, sorting, and page indexes.
- `GET /:id` - Fetches details of a single product.
- `POST /` - Creates a listing (uploads up to 3 images to Cloudinary).
- `PUT /:id` - Updates a listing and replaces old Cloudinary images.
- `DELETE /:id` - Deletes a listing.
- `PATCH /:id/status` - Marks listing as `"Available"` or `"Sold"`.
- `POST /:id/renew` - Refreshes listing timestamps.
- `POST /:id/report` - Submits a report about a listing.

### Chats & Messaging (`/api/chat` & Sockets)
- `GET /chat/conversation/:conversationId` - Fetches message logs between two participants.
- `GET /conversations/:userId` - Fetches all chat lists involving the user.
- `PATCH /chat/conversation/:conversationId/read` - Marks unread messages as read.

### Notifications (`/api/notifications`)
- `GET /` - Fetches unread notification feeds.
- `PATCH /read-all` - Marks all notifications as read.
- `PATCH /:id/read` - Marks a specific notification as read.
