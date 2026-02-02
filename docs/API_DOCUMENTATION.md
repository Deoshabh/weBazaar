# API Documentation

## Base URL

```
Production: https://api.radeo.in
Development: http://localhost:5000
```

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Authentication](#authentication-endpoints)
3. [Products](#product-endpoints)
4. [Cart](#cart-endpoints)
5. [Orders](#order-endpoints)
6. [Wishlist](#wishlist-endpoints)
7. [Addresses](#address-endpoints)
8. [Categories](#category-endpoints)
9. [Coupons](#coupon-endpoints)
10. [User Profile](#user-profile-endpoints)
11. [Admin - Products](#admin-products)
12. [Admin - Orders](#admin-orders)
13. [Admin - Users](#admin-users)
14. [Admin - Categories](#admin-categories)
15. [Admin - Coupons](#admin-coupons)
16. [Admin - Stats](#admin-stats)
17. [Admin - Media](#admin-media)

---

## Health Check

### GET /api/health

**Public** - Check API health status

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "uptime": 12345,
  "environment": "production",
  "services": {
    "api": "operational",
    "database": "operational",
    "memory": {
      "used": "128MB",
      "total": "256MB"
    }
  }
}
```

### GET /api/health/ready

**Public** - Kubernetes readiness probe

### GET /api/health/live

**Public** - Kubernetes liveness probe

---

## Authentication Endpoints

### POST /api/v1/auth/register

**Public** - Register a new user

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "9876543210"
}
```

**Validation:**

- Name: 2-50 characters
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Phone: 10 digits (optional)

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "65f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### POST /api/v1/auth/login

**Public** - Login user

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "_id": "65f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### POST /api/v1/auth/refresh

**Public** - Refresh access token

**Request Body:**

```json
{
  "refreshToken": "eyJhbG..."
}
```

### POST /api/v1/auth/logout

**Protected** - Logout user

---

## Product Endpoints

### GET /api/v1/products

**Public** - Get all active products with filters

**Query Parameters:**

- `category` - Filter by category ID
- `brand` - Filter by brand
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `size` - Filter by size
- `color` - Filter by color
- `search` - Search in name/description
- `sort` - Sort by: price, -price, createdAt, -createdAt
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Response:**

```json
{
  "products": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 9,
    "limit": 12
  }
}
```

### GET /api/v1/products/:slug

**Public** - Get product by slug

**Response:**

```json
{
  "_id": "65f...",
  "name": "Nike Air Max",
  "slug": "nike-air-max",
  "description": "...",
  "price": 5999,
  "images": ["https://..."],
  "category": {...},
  "sizes": ["8", "9", "10"],
  "colors": [...],
  "isActive": true
}
```

---

## Cart Endpoints

### GET /api/v1/cart

**Protected** - Get user's cart

**Response:**

```json
{
  "_id": "65f...",
  "user": "65f...",
  "items": [
    {
      "product": {...},
      "quantity": 2,
      "size": "9",
      "color": "Black",
      "price": 5999
    }
  ],
  "subtotal": 11998,
  "total": 11998
}
```

### POST /api/v1/cart/add

**Protected** - Add item to cart

**Request Body:**

```json
{
  "productId": "65f...",
  "quantity": 1,
  "size": "9",
  "color": "Black"
}
```

**Validation:**

- productId: Valid MongoDB ObjectId
- quantity: Min 1
- size: Optional string
- color: Optional string

### PATCH /api/v1/cart/items/:itemId

**Protected** - Update cart item quantity

**Request Body:**

```json
{
  "quantity": 3
}
```

### DELETE /api/v1/cart/items/:itemId

**Protected** - Remove item from cart

### DELETE /api/v1/cart/clear

**Protected** - Clear entire cart

---

## Order Endpoints

### GET /api/v1/orders

**Protected** - Get user's orders

**Response:**

```json
{
  "orders": [
    {
      "_id": "65f...",
      "orderNumber": "ORD-2026-001",
      "items": [...],
      "total": 11998,
      "status": "processing",
      "shippingAddress": {...},
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  ]
}
```

### GET /api/v1/orders/:id

**Protected** - Get order by ID

### POST /api/v1/orders

**Protected** - Create new order

**Request Body:**

```json
{
  "shippingAddressId": "65f...",
  "billingAddressId": "65f...",
  "paymentMethod": "razorpay",
  "couponCode": "SAVE20"
}
```

**Validation:**

- shippingAddressId: Required, valid ObjectId
- billingAddressId: Optional, valid ObjectId
- paymentMethod: One of: cod, razorpay, card
- couponCode: Optional string

### POST /api/v1/orders/:id/cancel

**Protected** - Cancel order (only if status is 'pending')

---

## Wishlist Endpoints

### GET /api/v1/wishlist

**Protected** - Get user's wishlist

### POST /api/v1/wishlist/add

**Protected** - Add product to wishlist

**Request Body:**

```json
{
  "productId": "65f..."
}
```

### DELETE /api/v1/wishlist/remove/:productId

**Protected** - Remove product from wishlist

---

## Address Endpoints

### GET /api/v1/addresses

**Protected** - Get user's addresses

### POST /api/v1/addresses

**Protected** - Create new address

**Request Body:**

```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "isDefault": false
}
```

**Validation:**

- fullName: Min 2 characters
- phone: Exactly 10 digits
- addressLine1: Min 5 characters
- city, state: Min 2 characters
- pincode: Exactly 6 digits

### PATCH /api/v1/addresses/:id

**Protected** - Update address

### DELETE /api/v1/addresses/:id

**Protected** - Delete address

### PATCH /api/v1/addresses/:id/default

**Protected** - Set address as default

---

## Category Endpoints

### GET /api/v1/categories

**Public** - Get all active categories

**Response:**

```json
{
  "categories": [
    {
      "_id": "65f...",
      "name": "Running Shoes",
      "slug": "running-shoes",
      "image": "https://...",
      "isActive": true
    }
  ]
}
```

### GET /api/v1/categories/:slug

**Public** - Get category by slug

---

## Coupon Endpoints

### POST /api/v1/coupons/validate

**Protected** - Validate coupon code

**Request Body:**

```json
{
  "code": "SAVE20",
  "orderValue": 5000
}
```

**Response:**

```json
{
  "valid": true,
  "discount": 1000,
  "coupon": {
    "code": "SAVE20",
    "type": "percentage",
    "value": 20
  }
}
```

---

## User Profile Endpoints

### GET /api/v1/user/profile

**Protected** - Get user profile

### PATCH /api/v1/user/profile

**Protected** - Update user profile

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "avatar": "https://..."
}
```

### POST /api/v1/user/change-password

**Protected** - Change password

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

---

## Admin - Products

**All endpoints require admin role**

### GET /api/v1/admin/products

Get all products (including inactive)

### GET /api/v1/admin/products/:id

Get product by ID

### POST /api/v1/admin/products

Create new product

### PATCH /api/v1/admin/products/:id

Update product

### DELETE /api/v1/admin/products/:id

Delete product

### PATCH /api/v1/admin/products/:id/toggle

Toggle product active status

---

## Admin - Orders

### GET /api/v1/admin/orders

Get all orders

### GET /api/v1/admin/orders/:id

Get order by ID

### PATCH /api/v1/admin/orders/:id

Update order status

**Request Body:**

```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123"
}
```

---

## Admin - Users

### GET /api/v1/admin/users

Get all users

### GET /api/v1/admin/users/:id

Get user by ID

### PATCH /api/v1/admin/users/:id

Update user role

### DELETE /api/v1/admin/users/:id

Delete user

---

## Admin - Categories

### GET /api/v1/admin/categories

Get all categories

### POST /api/v1/admin/categories

Create category

### PATCH /api/v1/admin/categories/:id

Update category

### DELETE /api/v1/admin/categories/:id

Delete category

---

## Admin - Coupons

### GET /api/v1/admin/coupons

Get all coupons

### POST /api/v1/admin/coupons

Create coupon

### PATCH /api/v1/admin/coupons/:id

Update coupon

### DELETE /api/v1/admin/coupons/:id

Delete coupon

---

## Admin - Stats

### GET /api/v1/admin/stats

Get dashboard statistics

**Response:**

```json
{
  "revenue": {
    "total": 1234567,
    "today": 12345,
    "thisMonth": 234567
  },
  "orders": {
    "total": 1234,
    "pending": 45,
    "processing": 23
  },
  "products": {
    "total": 567,
    "active": 500,
    "outOfStock": 12
  },
  "users": {
    "total": 890,
    "new": 23
  }
}
```

---

## Admin - Media

### POST /api/v1/admin/media/upload

Upload media file (images)

**Request:**

- Content-Type: multipart/form-data
- Field name: file
- Max size: 5MB
- Formats: jpg, jpeg, png, webp

**Response:**

```json
{
  "url": "https://cdn.radeo.in/products/..."
}
```

### DELETE /api/v1/admin/media

Delete media file

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### HTTP Status Codes

- `200` OK - Request successful
- `201` Created - Resource created
- `400` Bad Request - Validation error
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Resource already exists
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server error

---

## Rate Limiting

- Window: 15 minutes
- Max Requests: 1000 per IP
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining

---

## Best Practices

1. Always use HTTPS in production
2. Store tokens securely (httpOnly cookies recommended)
3. Refresh access token before expiry (15 minutes)
4. Handle errors gracefully
5. Validate all inputs on client side too
6. Use pagination for large lists
7. Implement retry logic for failed requests

---

**Last Updated:** February 3, 2026  
**API Version:** v1  
**Support:** support@radeo.in
