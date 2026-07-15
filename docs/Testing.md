# Testing Protocols & Validation Workflows

This document outlines the manual, API, Socket, and security testing protocols to verify the stability of the **Hostel Trade** codebase.

---

## 1. Authentication & Authorization Tests

Verify registration constraints, session cookie states, and role-based route access:

| Test Case ID | Path Target | Input / Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | `POST /api/auth/register` | Valid student data | Returns `201 Created`, user role set to `student`, `verified: false`. |
| **TC-AUTH-02** | `POST /api/auth/register` | Duplicate email payload | Returns `400 Bad Request` ("User already exists"). |
| **TC-AUTH-03** | `POST /api/auth/login` | Valid credentials (pending) | Returns `403 Forbidden` ("Account is pending approval"). |
| **TC-AUTH-04** | `POST /api/users/:id/verify` | PATCH via Admin account | Returns `200 OK`, user's `verified` state set to `true`. |
| **TC-AUTH-05** | `POST /api/auth/login` | Valid credentials (verified) | Returns `200 OK`, issues `jwt` session cookie. |
| **TC-AUTH-06** | `/api/users` | GET request without JWT | Returns `401 Unauthorized` ("Not authorized, no token"). |
| **TC-AUTH-07** | `/api/users` | GET request via Student role | Returns `403 Forbidden` ("Not authorized as admin"). |

---

## 2. API Search & Filtering Tests

Test search parameters, category filters, and ReDoS defense triggers on the `/api/products` route:

1. **Category Filter**:
   - **Request**: `GET /api/products?category=Electronics`
   - **Validation**: Ensure only items with `category: "Electronics"` are returned.
2. **Price Range**:
   - **Request**: `GET /api/products?minPrice=500&maxPrice=1500`
   - **Validation**: Ensure all returned products fall within the specified price range ($500 \le \text{Price} \le 1500$).
3. **Hostel Filter**:
   - **Request**: `GET /api/products?hostel=Krishna`
   - **Validation**:
     - The server first queries users matching `hostel: "Krishna"`.
     - Ensures only products listed by users in the Krishna hostel are returned.
4. **ReDoS Defense**:
   - **Request**: `GET /api/products?search=(a%2B)%2B`
   - **Validation**: Ensure the query escapes regex operators and executes successfully without high CPU usage.

---

## 3. Real-Time Chat & Socket.io Tests

Verify WebSocket handshake states, room routing, and event exchanges:

```text
               [Socket.io Server]
                 /            \
        (joins Room)        (joins Room)
               /                \
        [Alice Client]     [Bob Client]
```

1. **Handshake & Register**:
   - Alice connects and emits `registerUser` with her `userId`.
   - Bob connects and emits `registerUser` with his `userId`.
   - Verify both clients receive the `onlineUsersList` event containing their user IDs.
2. **Room Allocation**:
   - Alice opens Bob's listing profile and clicks "Contact Seller".
   - Alice emits `joinConversation` with `conversationId: "AliceID-BobID"`.
   - Bob opens Alice's chat and emits `joinConversation` with the same ID.
   - Verify both sockets are joined to the same conversation room.
3. **Typing Indicators**:
   - Alice starts typing in the input box.
   - Verify Bob's client receives the `typingStatus` event with `{ userId: AliceID, isTyping: true }` and displays the typing indicator.
   - Alice stops typing. Verify Bob's client receives the event with `isTyping: false` and removes the typing indicator.
4. **Read Receipts**:
   - Alice sends a message, which is saved in MongoDB with `read: false`.
   - Bob opens the chat room. Bob's client emits `markAsRead`.
   - Verify Bob's client makes the API call to update the message's read state to `true` in the database.
   - Verify Alice's client receives the `messagesRead` event and displays double green checkmarks.

---

## 4. Security Vulnerability Tests

Verify file upload filters, NoSQL Injection defenses, and XSS sanitizations:

### 1. NoSQL Injection
- **Action**: Send a login payload containing MongoDB operator keys:
  ```json
  {
    "email": { "$gt": "" },
    "password": "SecurePassword123"
  }
  ```
- **Validation**: The custom `stripMongoOperators` middleware should intercept the request, sanitize the email field, and fail the request safely with a `400 Bad Request` or `401 Unauthorized` instead of executing a wildcard database lookup.

---

### 2. Malicious File Uploads
- **Action 1**: Upload a script file named `exploit.php` inside the product form.
  - **Validation**: Multer's file filter should block the file and return an error message: `"Upload failed. Only image files (jpg, jpeg, png, webp) are permitted."`.
- **Action 2**: Upload an image file larger than 5MB (e.g. `heavy_photo.png`).
  - **Validation**: Multer's size limits should reject the file and return a limit violation error.
- **Action 3**: Upload a valid image named `../../malicious_file.png`.
  - **Validation**: Verify the server discards the filename, renames it using a random UUIDv4, and saves it safely in the uploads folder.
