# API Contract Documentation - DAPOGIZI Backend

Base URL: `http://localhost:{PORT}`

## Table of Contents
- [Authentication](#authentication)
- [Vendor Endpoints](#vendor-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Responses](#error-responses)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### Signup (Vendor Registration)

**Endpoint:** `POST /user/auth/signup`

**Description:** Register a new vendor account

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "securePassword123",
  "vendor_name": "My Restaurant"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Signup success",
  "userId": "60d5ec49f1b2c72b8c8e4a1b",
  "role": "vendor"
}
```

**Error Responses:**
- `400` - Email already exists / Vendor name required
- `500` - Server error

---

### Login

**Endpoint:** `POST /user/auth/login`

**Description:** Authenticate user and receive JWT token

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "vendor"
}
```

**Error Responses:**
- `400` - User not found / Invalid credentials
- `500` - Server error

---

### Get Vendor Profile

**Endpoint:** `GET /user/auth/me`

**Description:** Get authenticated vendor's profile information

**Authentication:** Required (Vendor role)

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "vendor": {
    "_id": "60d5ec49f1b2c72b8c8e4a1b",
    "user_id": "60d5ec49f1b2c72b8c8e4a1a",
    "vendor_name": "My Restaurant",
    "address": "123 Main St",
    "location": {
      "type": "Point",
      "coordinates": [0, 0]
    },
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - No token provided / Invalid or expired token
- `403` - Not a vendor

---

## Vendor Endpoints

### Get My Submissions

**Endpoint:** `GET /vendor/submissions`

**Description:** Get authenticated vendor's meal plan submissions with optional date filtering

**Authentication:** Required (Vendor role)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `createdAt` (optional) : Filter submissions created on or after this date in ISO format (YYYY-MM-DD)
  - Example: `2025-01-01`

**Example Requests:**
```
GET /vendor/submissions
GET /vendor/submissions?createdAt=2025-01-01
```

**Success Response (200):**
```json
{
  "success": true,
  "total_count": 15,
  "data": [
    {
      "id": "60d5ec49f1b2c72b8c8e4a1c",
      "name": "Healthy Lunch Box",
      "image_url": "https://example.com/image.jpg",
      "status": "approved",
      "approved_by": "admin@example.com",
      "approved_at": "2025-01-20T14:30:00.000Z",
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-20T14:30:00.000Z"
    },
    {
      "id": "60d5ec49f1b2c72b8c8e4a1d",
      "name": "Vegetarian Special",
      "image_url": null,
      "status": "pending",
      "approved_by": null,
      "approved_at": null,
      "created_at": "2025-01-18T09:15:00.000Z",
      "updated_at": "2025-01-18T09:15:00.000Z"
    }
  ],
  "filter_applied": {
    "created_at": "2025-01-01"
  }
}
```

**Meal Plan Status Values:**
- `pending` - Awaiting admin approval
- `approved` - Approved by admin
- `rejected` - Rejected by admin

**Error Responses:**
- `400` - Invalid date format
- `401` - No authorization token / Invalid or expired token
- `403` - Access denied (not a vendor)
- `404` - Vendor profile not found
- `500` - Server error

---

## Admin Endpoints

> **Note:** All admin endpoints require JWT authentication with admin role.

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer {token}
```

### Get All Vendors

**Endpoint:** `GET /admin/view-vendors`

**Description:** Get list of all registered vendors

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "60d5ec49f1b2c72b8c8e4a1b",
      "vendor_name": "My Restaurant",
      "address": "123 Main St",
      "email": "vendor@example.com"
    }
  ]
}
```

**Error Responses:**
- `401` - No authorization token / Invalid or expired token
- `403` - Access denied (not an admin)
- `500` - Server error

---

### Get Vendor Details

**Endpoint:** `GET /admin/view-vendor/:id`

**Description:** Get detailed information for a specific vendor

**URL Parameters:**
- `id`: Vendor ID

**Example Request:**
```
GET /admin/view-vendor/60d5ec49f1b2c72b8c8e4a1b
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "vendor_name": "My Restaurant",
    "address": "123 Main St",
    "email": "vendor@example.com"
  }
}
```

**Error Responses:**
- `401` - No authorization token / Invalid or expired token
- `403` - Access denied (not an admin)
- `404` - Vendor not found
- `500` - Server error

---

### Get Kitchen Checks for Vendor

**Endpoint:** `GET /admin/kitchen-checks/vendor/:vendorId`

**Description:** Get all kitchen cleanliness check records for a specific vendor

**URL Parameters:**
- `vendorId`: Vendor ID

**Example Request:**
```
GET /admin/kitchen-checks/vendor/60d5ec49f1b2c72b8c8e4a1b
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "60d5ec49f1b2c72b8c8e4a2a",
      "check_date": "2025-01-15T08:00:00.000Z",
      "score": 95,
      "status": "clean",
      "notes": "Excellent cleanliness standards maintained",
      "checked_by": "inspector@example.com"
    }
  ]
}
```

**Kitchen Check Status Values:**
- `clean` - Kitchen passed cleanliness inspection
- `unclean` - Kitchen failed cleanliness inspection

**Error Responses:**
- `401` - No authorization token / Invalid or expired token
- `403` - Access denied (not an admin)
- `500` - Server error

---

### Update Kitchen Check

**Endpoint:** `PUT /admin/kitchen-check/:checkId`

**Description:** Update a kitchen cleanliness check record

**URL Parameters:**
- `checkId`: Kitchen check ID

**Request Body:**
```json
{
  "score": 98,
  "status": "clean",
  "notes": "Outstanding cleanliness"
}
```

**Note:** All fields are optional - only include fields you want to update

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4a2a",
    "vendor_id": "60d5ec49f1b2c72b8c8e4a1b",
    "check_date": "2025-01-15T08:00:00.000Z",
    "score": 98,
    "status": "clean",
    "notes": "Outstanding cleanliness",
    "checked_by": "60d5ec49f1b2c72b8c8e4a1f"
  }
}
```

**Error Responses:**
- `401` - No authorization token / Invalid or expired token
- `403` - Access denied (not an admin)
- `404` - Kitchen check not found
- `500` - Server error

---

### Get Vendors' Meal Plan Status

**Endpoint:** `GET /admin/vendors-meal-plans`

**Description:** Get all vendors' meal plan submission status

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "vendor_name": "My Restaurant",
      "address": "123 Main St",
      "meal_plan": {
        "name": "Healthy Lunch Box",
        "status": "approved"
      }
    },
    {
      "vendor_name": "Another Vendor",
      "address": "456 Oak Ave",
      "meal_plan": {
        "name": "Special Menu",
        "status": "pending"
      }
    }
  ]
}
```

**Error Responses:**
- `401` - No authorization token / Invalid or expired token
- `403` - Access denied (not an admin)
- `500` - Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Internal server error

---

## Database Configuration

**Database Name:** `dapogizi_new`

**Collections:**
- `users` - User authentication data
- `vendors` - Vendor profile information
- `mealplans` - Meal plan submissions
- `mealdetails` - Nutritional details for meal plans
- `kitchen_cleanliness_checks` - Kitchen inspection records

---

## Notes

1. **Date Format:** All dates should be in ISO 8601 format
   - For query parameters: `YYYY-MM-DD` (e.g., `2025-01-15`)
   - In responses: Full ISO format with timezone (e.g., `2025-01-15T10:30:00.000Z`)

2. **Authentication:** 
   - JWT tokens expire after 1 day
   - All `/admin/*` endpoints require admin role
   - All `/vendor/*` endpoints require vendor role
   - `/user/auth/signup` and `/user/auth/login` do not require authentication

3. **Vendor Submissions:** 
   - The `/vendor/submissions` endpoint only returns submissions belonging to the authenticated vendor
   - Use `createdAt` parameter to filter submissions from a specific date onwards

4. **Success Field:** All responses include a `success` field (boolean) to indicate operation status

5. **Role-Based Access:**
   - Admin users can access all `/admin/*` endpoints
   - Vendor users can access `/vendor/*` and `/user/auth/me` endpoints
   - Attempting to access endpoints without proper role will return 403 Forbidden
