# Search Architecture & ReDoS Prevention

This document describes the search engine architecture, query filtering, and ReDoS (Regular Expression Denial of Service) protection implemented in **Hostel Trade**.

---

## 1. The Vulnerability: Regular Expression Denial of Service (ReDoS)

When backend servers compile regex queries directly from user inputs (e.g. `new RegExp(req.query.search)`), attackers can send malicious strings containing repeating overlapping groups (e.g. `(a+)+` or `[a-zA-Z]+_*`). If these inputs are evaluated against long text blocks, the regex engine can experience exponential backtracking, freezing the server's CPU.

---

## 2. ReDoS Protection (`utils/escapeRegex.js`)

Hostel Trade mitigates this vulnerability by escaping all regex special characters from user inputs before compiling queries:

```javascript
export const escapeRegex = (string) => {
  if (!string || typeof string !== "string") return "";
  // Escapes characters: - / \ ^ $ * + ? . ( ) | [ ] { }
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
```
This utility converts search strings into literals. For example, if an attacker searches for `(a+)+`, the query compiles to `\(a\+\)\+` instead of an active regular expression.

---

## 3. Search Engine Implementations

### 1. Marketplace Product Search (`productController.js`)
The product search matches terms against the product name and description:
```javascript
if (search) {
  const escapedSearch = escapeRegex(search);
  query.$or = [
    { name: { $regex: escapedSearch, $options: "i" } },
    { description: { $regex: escapedSearch, $options: "i" } }
  ];
}
```

#### MongoDB Optimization
To optimize search queries, the Product collection has indexes configured for category, price, and newest items:
* `{ category: 1 }`
* `{ price: 1 }`
* `{ createdAt: -1 }`
* `{ name: "text", description: "text" }` (supports full-text search index lookups).

---

### 2. Lost & Found Multi-Field Search (`lostFoundController.js`)
The Lost & Found search matches terms across multiple fields, including title, description, category, location, and hostel:
```javascript
if (search) {
  const escapedSearch = escapeRegex(search);
  const searchRegex = { $regex: escapedSearch, $options: "i" };
  query.$or = [
    { title: searchRegex },
    { description: searchRegex },
    { category: searchRegex },
    { hostel: searchRegex },
    { location: searchRegex },
  ];
}
```

---

## 4. Query Pagination Math

Pagination queries utilize the `skip` and `limit` logic:

```javascript
const { page = 1, limit = 9 } = req.query;
const skip = (Number(page) - 1) * Number(limit);
```

### Response Payload Structure
The API returns the paginated data along with metadata to help the frontend render navigation controls:
* **`products`** / **`items`**: Array of matching documents.
* **`page`**: Current page number.
* **`pages`**: Total page count, calculated as:
  $$\text{Pages} = \lceil \text{Total matching items} / \text{Limit} \rceil$$
* **`total`**: Total number of matching documents.
