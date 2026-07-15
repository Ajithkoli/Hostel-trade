# Frontend Architecture & Component Documentation

This document describes the structure, routing, pages, reusable UI components, and client-side utilities of the Vite-React SPA (Single Page Application) for **Hostel Trade**.

---

## 1. Application Initialization & Routing

### Entry Point (`frontend/src/main.jsx`)
Initializes the React application:
- Mounts the App component inside the DOM's `#root` element.
- Wraps the application in a Redux store provider (`store`).
- Includes core style sheets (`index.css`).

### Router Config (`frontend/src/App.jsx`)
- Uses `react-router-dom` (`BrowserRouter`) to configure client-side paths.
- Triggers `checkAuth` when mounting to load active user sessions from local storage.
- Orchestrates route access constraints:
  - **`PrivateRoute`**: Wraps routes requiring authentication, redirecting unauthenticated users to `/login`.
  - **`AdminRoute`**: Wraps admin dashboard views, redirecting non-admin users to `/login`.
- Renders the global `<Navbar />` and `<ToastContainer />` across pages.

---

## 2. Page Components (`frontend/src/pages/`)

### `Home.jsx`
- Represents the index landing view.
- Features a **Hero section** prompting students to browse the marketplace or list items.
- Displays key product categories using category card links.
- Showcases the latest listings dynamically fetched from the marketplace.

### `Marketplace.jsx`
- The core marketplace browse page.
- Lists available items for buy/rent with paginated navigation (powered by `productSlice` / `/api/products`).
- Integrates multi-parameter filtering:
  - Text search (escaped against ReDoS).
  - Category tags (Electronics, Books, Electrical, Vehicles, Miscellaneous).
  - Intent selector (Buy, Rent).
  - Price bounds (minPrice, maxPrice).
  - Seller hostel hall.
  - Custom sort selectors (Price Ascending/Descending, Newest/Oldest).

### `SingleProduct.jsx`
- Displays individual listing detail views.
- Loads image arrays into an interactive carousel.
- Displays item status tags ("Available" or "Sold").
- Displays seller names, emails, and hostel locations.
- Actions:
  - "Add to Cart" or "Remove from Cart".
  - "Contact Seller": Dynamically constructs a conversation ID between buyer and seller using sorted user IDs, and redirects the student to the chat interface (`/inbox?receiver=<seller_id>`).
  - "Report Listing": Opens a report prompt. Prevents self-reporting.

### `AddProduct.jsx`
- Form wizard for creating new product listings.
- Fields: Name, Category, Price, Stock, Intent, and Description.
- Supports uploading up to 3 product photos. Uses standard browser forms with Multi-part Form Data processing.
- Shows processing states while images are uploading.

### `MyProducts.jsx` (Route: `/dashboard`)
- The personal dashboard for sellers to manage their items.
- Lists all active listings published by the authenticated user.
- Actions:
  - **Mark Sold / Mark Available**: Toggles listing status.
  - **Renew Listing**: Refreshes listing dates to bump the listing back to the top of the search feed.
  - **Delete Listing**: Removes the listing, including associated Cloudinary assets.

### `Cart.jsx`
- Lists items selected for acquisition.
- Renders product cards, item prices, quantities, and calculates the cart total.
- Offers removal and clearing options. Persists cart state in `localStorage` under the key `campusCartCart`.

### `WishlistPage.jsx`
- Displays items favorited by the student.
- Synchronizes with the User document's `wishlist` array using Redux actions.

### `LostFoundPage.jsx` & `LostFoundDetailsPage.jsx` & `CreateLostFoundPost.jsx`
- The Lost & Found portal.
- Let students browse, details, and publish lost/found items with categories, location fields, hostel information, lost dates, contact preferences (Chat, Email, Phone), and reward values.

### `InboxPage.jsx`
- Full-screen real-time messaging workspace (explained in-depth in `docs/SocketIO.md`).
- Features a split-pane layout: a sidebar showing active conversation channels with user avatars and online indicators, and a chat window containing message history.
- Handles user typing indicators, message dispatching, read receipts, and online list broadcasts.

### `Profile.jsx`
- User management workspace.
- Actions:
  - **Edit Info**: Updates name and hostel location.
  - **Update Avatar**: Uploads a profile photo to Cloudinary.
  - **Change Password**: Validates current password and updates to a new one.
  - **Delete Account**: Triggers a complete account deletion (clears user products, chats, and avatar from Cloudinary).
  - **My Posts**: Quick link views to see own listings.

### `Login.jsx` & `Register.jsx`
- Authentication forms using the `AuthLayout` template.
- Registers users with their name, email, password, and hostel location. Displays pending admin verification notices if users attempt to log in before being approved.
- *Notice*: The login form links to `/forgot-password` but there is no matching route path in `App.jsx`.

### `RegistrationPending.jsx`
- An informative landing view for newly registered users whose applications are awaiting admin approval.

---

## 3. Reusable UI Components (`frontend/src/components/`)

- **`Navbar.jsx`**: Responsive top bar with search inputs, user dropdown menu, cart counter, messages count, and responsive admin dashboard quick-links.
- **`Footer.jsx`**: Bottom footer with links to Legal documents (Terms, Privacy) and contact information.
- **`ProductCard.jsx`**: Grid component displaying product thumbnail image (using `getImageUrl` fallback logic), price, intent status, seller hostel, wishlist action, and quick add-to-cart controls.
- **`LostFoundCard.jsx`**: Displays Lost & Found post status ("Lost" vs "Found"), location details, rewards, and contact preferences.
- **`Carousel.jsx`**: Image carousel displaying product images.
- **`AuthForm.jsx`**: Modular login/registration inputs.
- **`CartSidebar.jsx`**: Floating cart drawer showing selected items.
- **`EditUserModal.jsx`**: Modal enabling admins to update student usernames, emails, and hostel locations.
- **`PrivateRoute.jsx` / `AdminProtectedRoute.jsx` / `AdminRoute.jsx`**: Router guards checking user authenticated state and roles.

---

## 4. State Management (Redux Slices)
Refer to `docs/Redux.md` for full implementation details of the slices:
- `authSlice`: Handles registration, login, profile updates, wishlist toggles, and session checking.
- `productSlice`: Handles marketplace query filters, pagination, and listing searches.
- `lostFoundSlice`: Manages lost/found posts creation, updates, and detail views.
- `cartSlice`: Synchronizes cart actions with persistent `localStorage` states.
- `adminSlice`: Manages user approval lists, account updates, role updates, and user removals.
