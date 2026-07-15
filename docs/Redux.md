# State Management with Redux Toolkit

Hostel Trade manages client-side application states using **Redux Toolkit (RTK)** to orchestrate asynchronous data fetches, cached API responses, shopping cart contents, and authentication sessions.

---

## 1. Store Structure (`store/store.js`)

Redux uses a single store with combined reducers and a custom cart persistence middleware:

```javascript
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productReducer,
  admin: adminReducer,
  lostFound: lostFoundReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartPersistMiddleware),
});
```

---

## 2. Redux Slices

### 1. Auth Slice (`authSlice.js`)
Manages session tokens, student authentication, and profile updates.
- **State**:
  - `user`: User data parsed from localStorage (`userInfo` key) or null.
  - `loading`: Boolean status for async actions.
  - `error`: Error messages from API responses.
  - `registrationSuccess`: Toggle indicating a successful registration, used to trigger UI redirects.
- **Sync Actions**: `clearError`, `resetRegistrationSuccess`.
- **Async Thunks (API integrations)**:
  - `registerUser`: Sends a registration payload to `/api/auth/register`.
  - `loginUser`: Performs authentication, stores user details in `localStorage`, and sets the Redux `user` state.
  - `logoutUser`: Clears backend cookies and sets the Redux `user` state to `null`.
  - `checkAuth`: Validates stored local tokens against the `/api/auth/me` endpoint.
  - `updateProfile`, `updateAvatar`, `changePassword`, `deleteAccount`.
  - `toggleWishlist`: Toggles items on the backend and updates the user's wishlist array.

---

### 2. Cart Slice (`cartSlice.js`)
Manages the local shopping cart. Uses custom Redux middleware to sync the cart state to local storage:
- **State**:
  - `items`: Array of product objects with an added `quantity` counter: `Array<{ product, quantity }>`.
  - `total`: Total cost of items in the cart.
- **Sync Actions**:
  - `addItem`: Adds an item or increments the quantity if it already exists, and recalculates the total.
  - `removeItem`: Removes a product from the cart and updates the total price.
  - `clearCart`: Resets the cart items array to empty and sets the total price to 0.
- **Async Thunks**:
  - `loadCart`: Loads cart data from `localStorage` under the key `campusCartCart`.
  - `saveCart`: Saves the cart state to `localStorage`.
- **`cartPersistMiddleware`**:
  An interceptor that runs after cart mutations to save the updated state to local storage:
  ```javascript
  export const cartPersistMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    if (action.type?.startsWith("cart/")) {
      const { cart } = store.getState();
      store.dispatch(saveCart(cart));
    }
    return result;
  };
  ```

---

### 3. Product Slice (`productSlice.js`)
Manages marketplace search listings, filtering parameters, and page counters.
- **State**:
  - `items`: Array of products fetched from the backend.
  - `page` / `pages` / `total`: Pagination metadata.
  - `status`: Loading states (`idle`, `loading`, `succeeded`, `failed`).
  - `error`: Error messages from API requests.
- **Async Thunk**:
  - `fetchProducts(params)`: Queries `/api/products` using params (search, category, intent, minPrice, maxPrice, hostel, sort, page, limit).

---

### 4. Lost & Found Slice (`lostFoundSlice.js`)
Manages lost/found posts, detail pages, and creation triggers.
- **State**:
  - `items`: List of active lost/found posts.
  - `currentItem`: Details of the currently viewed item.
  - `relatedItems`: List of related posts.
  - `page` / `pages` / `total`: Pagination data.
  - `status` / `detailsStatus`: Async loading indicators.
- **Sync Actions**: `resetCurrentItem` (cleans detail caches on page transition).
- **Async Thunks**:
  - `fetchLostFoundPosts(params)`, `fetchLostFoundPostDetails(id)`.
  - `createLostFoundPost`, `updateLostFoundPost`, `deleteLostFoundPost` (attaches authorization headers automatically).

---

### 5. Admin Slice (`adminSlice.js`)
Manages the admin dashboard portal state.
- **State**:
  - `users`: List of student accounts.
  - `loading` / `error`: Data fetch indicators.
- **Async Thunks**:
  - `fetchUsers`: Fetches all non-admin student accounts.
  - `approveUser(id)`: Verifies user registration state.
  - `rejectUser(id)`: Deletes/Rejects a student account.
  - `makeAdmin(id)`: Toggles user access role.
  - `editUser({ id, data })`: Modifies student details.
