# System Architecture & Project Overview

This document provides a comprehensive overview of the system architecture, design decisions, and high-level workflows for the **Hostel Trade** (internally referenced as *CampusCart*) peer-to-peer trading application.

---

## 1. Project Overview

### Problem Statement
On university campuses and hostel complexes, students frequently need to buy, sell, or rent items (electronics, books, appliances, vehicles) and report lost or found items. Existing platforms like eBay or Craigslist are too broad, carry security risks from external parties, and lack localized hostel-level filtering.

### Motivation
To build a closed-loop, secure, and authenticated campus-only marketplace that facilitates direct transactions within student housing. Restricting accessibility to approved hostel residents minimizes security risks, fraud, and logistical overhead.

### Objectives
1. **Hostel-Restricted Access**: Implement an admin verification system to approve student registrations before they can transact.
2. **Double-Sided Marketplace**: Allow students to list items for buy/rent and manage their listings.
3. **Lost & Found Registry**: Provide a centralized directory for lost/found items with localized location/hostel details.
4. **Real-time Negotiation**: Facilitate instant messaging between buyers and sellers to negotiate without disclosing personal phone numbers.
5. **Secure Asset Hosting**: Provide secure image uploads for product and profile avatars.

### Folder Structure

The project follows a clean separation of concerns in a monorepo format:

```text
Hostel-trade/
├── backend/
│   ├── config/             # DB connection configuration
│   ├── controllers/        # Express request controllers (Business Logic)
│   ├── middleware/         # Auth, validation, file upload, error handlers
│   ├── models/             # Mongoose schemas (User, Product, LostFound, etc.)
│   ├── routes/             # REST API endpoint declarations
│   ├── uploads/            # Temporary disk storage for uploads (dev fallback)
│   ├── utils/              # Email, Cloudinary wrappers, regex sanitization
│   └── server.js           # Express entrypoint & Socket.io server
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── Admin/          # Admin portal components and layout
│   │   ├── assets/         # App assets (icons, styles)
│   │   ├── components/     # Reusable UI elements (Navbar, Cards, Chat)
│   │   ├── pages/          # Full page views (Home, Profile, Marketplace)
│   │   ├── store/          # Redux Toolkit slices, reducers, and store config
│   │   ├── utils/          # Client-side helper functions
│   │   ├── App.jsx         # App router and initialization
│   │   └── main.jsx        # React root rendering
│   ├── tailwind.config.cjs # Utility styling config
│   └── vite.config.js      # Vite build configurations
└── README.md
```

---

## 2. Software Architecture

Hostel Trade utilizes a **Client-Server Architecture** separating the frontend React SPA (Single Page Application) from the backend REST API & WebSocket server.

```mermaid
graph TD
    subgraph Client ["Frontend Client (Vite + React)"]
        UI[React Components] <--> Redux[Redux Toolkit Store]
        Redux <--> SocketClient[Socket.io-client]
        Redux <--> Axios[Axios HTTP Client]
    end

    subgraph Server ["Backend Server (Node.js + Express)"]
        Axios <--> Express[Express.js App]
        SocketClient <--> SocketServer[Socket.io Server]
        
        Express --> Middleware[Middlewares: Auth, Validation, Upload]
        Middleware --> Controllers[Controllers: Auth, Product, Chat, LostFound]
    end

    subgraph Database ["Data & Cloud Layer"]
        Controllers <--> Mongoose[Mongoose ODM]
        Mongoose <--> MongoDB[(MongoDB Atlas)]
        Controllers <--> Cloudinary[Cloudinary API]
        Controllers <--> Nodemailer[Nodemailer SMTP]
    end
```

---

## 3. Core Workflow Diagrams

### Request-Response Lifecycle
The lifecycle for a standard HTTP request follows this sequence:

```mermaid
sequenceDiagram
    autonumber
    actor Student as User Browser
    participant Express as Express.js Router
    participant Middleware as Middleware Pipeline
    participant Controller as Controller Handler
    participant Database as MongoDB (Mongoose)

    Student->>Express: Send HTTPS Request (e.g., POST /api/products)
    Express->>Middleware: Route Request
    activate Middleware
    Note over Middleware: Rate Limiter check,<br/>Token Authentication,<br/>Schema Validation
    alt Middleware validation fails
        Middleware-->>Student: 400 Bad Request / 401 Unauthorized
    else Validation passes
        Middleware->>Controller: Call handler(req, res, next)
        deactivate Middleware
        activate Controller
        Controller->>Database: Perform query/mutation
        Database-->>Controller: Return document result
        Controller-->>Student: Send JSON payload response (e.g., 201 Created)
        deactivate Controller
    end
```

### Authentication & Registration Flow
Students must register, but cannot log in until approved by an administrator.

```mermaid
sequenceDiagram
    autonumber
    actor User as Registering Student
    actor Admin as System Administrator
    participant DB as MongoDB
    
    User->>DB: Submit Registration Form (verified = false)
    Note over DB: Mongoose pre-save hashes password
    User->>User: Attempt Login
    alt User not approved (verified = false)
        DB-->>User: 403 Forbidden ("Account is pending approval")
    end
    
    Admin->>DB: GET /api/users (Lists pending students)
    Admin->>DB: PATCH /api/users/:id/verify (Approve student)
    DB-->>DB: Set verified = true
    
    User->>DB: Attempt Login (Email + Password)
    DB-->>User: 200 OK + Sets HTTP-Only Cookie (JWT) + Returns Token
```

### Image Upload Flow
Product images and profile avatars are handled via a local disk buffer before being uploaded to Cloudinary:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App
    participant Server as Express Server (Multer)
    participant Cloudinary as Cloudinary API
    participant DB as MongoDB

    Client->>Server: Multipart Form-Data (Images + Fields)
    Note over Server: Multer validates file types (jpeg, png, webp)<br/>and saves to local `/uploads` buffer
    Server->>Cloudinary: uploadToCloudinary(localFilePath)
    Cloudinary-->>Server: Return Secure URL (https://res.cloudinary.com/...)
    Note over Server: Delete local temporary file from server disk
    Server->>DB: Save product/profile document with Cloudinary URLs
    DB-->>Server: Saved Document
    Server-->>Client: Return HTTP 201 Response with details
```

### Real-Time Chat & Handshake Flow
Real-time negotiation is achieved using a dual HTTP/WebSocket approach. HTTP is used to retrieve histories, and WebSockets (Socket.io) are used for instant messaging, online presence updates, typing indicators, and read receipts.

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Client A (Buyer)
    participant Socket as Socket.io Server
    actor Bob as Client B (Seller)

    Alice->>Socket: Connect Handshake
    Socket-->>Alice: Connection Established
    Alice->>Socket: emit("registerUser", userId)
    Socket-->>Socket: Map userId to Socket ID
    Socket->>Bob: emit("onlineUsersList", [onlineUserIds])
    
    Alice->>Socket: emit("joinConversation", conversationId)
    Alice->>Socket: emit("typingStatus", { conversationId, isTyping: true })
    Socket->>Bob: broadcast typingStatus in room
    
    Alice->>Socket: emit("chatMessage", { conversationId, message })
    Note over Socket: ChatMessage is saved in MongoDB (read: false)
    Socket->>Bob: emit("newMessage", MessageDoc)
    
    Bob->>Socket: emit("markAsRead", { conversationId, userId })
    Note over Socket: Update messages in DB where read = true
    Socket->>Alice: emit("messagesRead", { conversationId })
```
