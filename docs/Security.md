# Security Architecture & Configurations

This document details the security layers, vulnerability defenses, and secure programming practices implemented inside **Hostel Trade**.

---

## 1. Authentication & Session Security

### HTTP-Only Cookies
JWT session tokens are stored in client cookies configured with security headers:
* **`httpOnly: true`**: Protects the token from cross-site scripting (XSS) by preventing access from client-side scripts (`document.cookie`).
* **`secure: process.env.NODE_ENV === 'production'`**: Transmits cookies only over encrypted SSL/TLS (HTTPS) connections.
* **`sameSite: 'lax'`**: Mitigates Cross-Site Request Forgery (CSRF) attacks by blocking cookie transmission on cross-site subrequests.

### Role Authorization guards
Access to admin-level actions is protected by two layers of middleware:
```javascript
router.use(protect); // Layer 1: Validates student session JWT token
router.use(isAdmin); // Layer 2: Validates if req.user.role === 'admin'
```
User ownership checks are implemented in resources controllers (e.g. updating products or lost-found items) to ensure only the original poster can modify their listings:
```javascript
if (!product.user.equals(req.user._id)) {
  return res.status(403).json({ message: "Not authorized" });
}
```

---

## 2. Infrastructure Defenses

### Helmet Security Headers
The Express app uses `helmet` to set HTTP headers that protect against clickjacking, mime sniffing, and protocol downgrades.
* **Content Security Policy (CSP)**: Configured to allow asset loading from local files, inline script executions, WebSocket connections (`ws:`, `wss:`), and Cloudinary images (`https://res.cloudinary.com`):
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5000", "http://127.0.0.1:5000"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "http://localhost:5000", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

### Rate Limiting
To prevent brute-force attacks, DDoS attempts, and listing spam, `express-rate-limit` is configured across four distinct scopes:

| Limiter Scope | Path Target | Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| **API Limiter** | `/api` | 300 requests / 15 mins | Prevents general API scraping and abuse |
| **Auth Limiter** | `/api/auth/login`, `/register`, `/forgotpassword`, `/resetpassword` | 15 requests / 15 mins | Blocks brute-force credential stuffing and password reset spam |
| **Product Limiter** | `POST /api/products` | 15 listings / hour | Mitigates automated listing spam |
| **Chat Limiter** | `/api/chat` | 60 messages / minute | Blocks chat spamming |

---

## 3. Input Sanitization & Validation

### NoSQL Injection Sanitization
To prevent NoSQL Injection attacks (where attackers send objects containing operators like `{"$gt": ""}` to bypass queries), a custom sanitizer middleware removes keys starting with `$` or containing `.`.

* **Express 5 Compatibility**: In Express 5, `req.query` is a read-only getter. To bypass this, we use `Object.defineProperty` to re-assign the sanitized query object:
```javascript
const stripMongoOperators = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripMongoOperators);
  return Object.keys(obj).reduce((acc, key) => {
    if (!key.startsWith('$') && !key.includes('.')) {
      acc[key] = stripMongoOperators(obj[key]);
    }
    return acc;
  }, {});
};

app.use((req, res, next) => {
  if (req.body) req.body = stripMongoOperators(req.body);
  if (req.params) req.params = stripMongoOperators(req.params);
  if (req.query) {
    try {
      const sanitizedQuery = stripMongoOperators({ ...req.query });
      Object.defineProperty(req, 'query', {
        value: sanitizedQuery,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {}
  }
  next();
});
```

### Input Validation & Encoding
- We use `express-validator` to enforce strict constraints (such as checking email structures, password complexity, and numeric bounds for prices).
- Inputs are trimmed (`.trim()`) and emails are normalized (`.normalizeEmail()`) to sanitize against XSS inputs.

### ReDoS Protection (Regular Expression Denial of Service)
Search queries undergo RegExp escaping in `escapeRegex.js` before being passed to MongoDB queries to prevent attackers from sending malicious strings that cause CPU timeouts:
```javascript
export const escapeRegex = (string) => {
  if (!string || typeof string !== "string") return "";
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
```

---

## 4. File Upload Security

Files uploaded via Multer are validated using three layers of defense:
1. **Filename Sanitization**: Original filenames are discarded and replaced with a randomly generated UUIDv4 to prevent directory traversal attacks (e.g. `../../filename.png`).
2. **Format Restrictions**: A file filter checks both the file extension and MIME type to allow only image files (`jpeg`, `jpg`, `png`, `webp`):
   ```javascript
   const allowedExtensions = /jpeg|jpg|png|webp/;
   const allowedMimeTypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;
   ```
3. **Upload Constraints**: Limits files to `5MB` and a maximum of `3` files per request to prevent disk space exhaustion attacks.
4. **Cloudinary Asset Deletion**: Deletion routines extract public IDs from storage URLs and send them to the Cloudinary API. This ensures images are removed from CDN nodes when a listing is deleted.

---

## 5. Safe Error Handling
The custom `errorHandler` hides debug information in production environments:
```javascript
res.status(statusCode).json({
  success: false,
  status,
  message,
  error: process.env.NODE_ENV === "development" ? {
    stack: err.stack,
    ...err
  } : undefined,
});
```
This prevents the exposure of server internals, database configurations, or file structures to end-users.
