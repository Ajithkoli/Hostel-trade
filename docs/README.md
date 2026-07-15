# Hostel Trade Technical Documentation Directory

Welcome to the technical documentation directory for **Hostel Trade** (internally referred to as *CampusCart*). This documentation provides a comprehensive guide to the application's architecture, database design, API endpoints, state management, and deployment.

---

## Documentation Index

### 1. Core Architecture & Infrastructure
* **[System Architecture](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Architecture.md)**: Problem statement, motivation, and system architecture design diagrams.
* **[Database Design](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Database.md)**: MongoDB schemas, field constraints, Mongoose hooks, and ER diagrams.
* **[REST API Specifications](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/API.md)**: Endpoint catalog, request/response payloads, and status codes.
* **[WebSocket Communication](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/SocketIO.md)**: Real-time chat, typing indicators, read receipts, and socket events.
* **[Security Architecture](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Security.md)**: Rate limiters, NoSQL injection prevention, XSS guards, and file filters.
* **[Cloud Deployment](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Deployment.md)**: Production hosting guidelines for Render, Vercel, Atlas, and Cloudinary.

### 2. Codebase Implementation Detail
* **[Backend Architecture](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Backend.md)**: Deep-dive into controllers, routers, middlewares, and server setup.
* **[Frontend Architecture](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Frontend.md)**: React routing, pages catalog, components, and layout templates.
* **[Redux State Management](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Redux.md)**: RTK store structure, slice configurations, and custom middlewares.
* **[Cloudinary Image Storage](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Cloudinary.md)**: Upload pipelines, local fallback configurations, and deletion cleanup.
* **[Code Walkthrough](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/CodeWalkthrough.md)**: Purpose, flow, and dependencies of core frontend and backend files.

### 3. Feature Breakdowns
* **[Marketplace Listings](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Marketplace.md)**: Search filters, price ranges, listing renewals, and status toggles.
* **[Lost & Found Portal](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/LostAndFound.md)**: Schema details, status updates, and related recommendations.
* **[User Wishlists](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Wishlist.md)**: Wishlist array integration, toggle APIs, and client-side syncing.
* **[Search & ReDoS Defenses](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Search.md)**: Regular expression escaping, full-text indexes, and pagination math.
* **[User Profile Management](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Profile.md)**: Password change validation, avatar updates, and deletion cascades.
* **[Admin Moderation Tools](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Admin.md)**: User approvals, admin dashboard stats, and database seed routes.

### 4. Operations, Optimization, & QA
* **[Performance Tuning](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Performance.md)**: Database indexes, query optimizations, debounces, and caching.
* **[Testing & Verification](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/Testing.md)**: Test cases for REST APIs, socket flows, and security filters.

### 5. Interview & Reference Guides
* **[End-to-End Tracing](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/ProjectExplanation.md)**: Tracing data flow from UI clicks down to database writes and back.
* **[Interview Prep Guide - Part 1](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/InterviewPrep.md)**: Detailed answers to questions 1-50.
* **[Interview Prep Guide - Part 2](file:///c:/Users/Ajith%20koli/Desktop/Hostel-trade/docs/InterviewPrep_Part2.md)**: Detailed answers to questions 51-100.
