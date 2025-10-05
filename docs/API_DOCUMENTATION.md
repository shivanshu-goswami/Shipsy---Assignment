# Expensify API Documentation

## Overview
Expensify is a comprehensive expense tracking REST API built with Next.js 15 and Prisma ORM. The API provides user authentication, expense management with CRUD operations, advanced filtering, search, sorting, and pagination capabilities.

**Base URL**: `http://localhost:3000/api` (Development)

---

## Authentication

All expense-related endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### JWT Token Details
- **Expiration**: 1 day
- **Algorithm**: HS256
- **Payload**: `{ userId, email }`

---

## Endpoints

### 1. User Registration

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user account.

**Authentication**: Not required

**Request Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules**:
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response** (201 Created):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "cm5abc123xyz",
    "email": "user@example.com"
  }
}
```

**Error Responses**:

400 Bad Request - Missing fields:
```json
{
  "error": "Email and password are required"
}
```

409 Conflict - Email already exists:
```json
{
  "error": "User already exists"
}
```

500 Internal Server Error:
```json
{
  "error": "Failed to create user"
}
```

---

### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user and receive JWT token.

**Authentication**: Not required

**Request Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm5abc123xyz",
    "email": "user@example.com"
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "error": "Email and password are required"
}
```

401 Unauthorized - Invalid credentials:
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. Create Expense

**Endpoint**: `POST /api/expenses`

**Description**: Create a new expense record.

**Authentication**: Required (JWT Bearer token)

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your-jwt-token>"
}
```

**Request Body**:
```json
{
  "description": "Business lunch with client",
  "base_amount": 1500.00,
  "tax_rate": 0.18,
  "category": "Food",
  "is_reimbursed": false
}
```

**Field Specifications**:
- `description`: String, required, 1-500 characters
- `base_amount`: Float, required, positive number
- `tax_rate`: Float, required, 0.0-1.0 (represents 0%-100%)
- `category`: Enum, required, one of: "Food", "Travel", "Office", "Other"
- `is_reimbursed`: Boolean, required

**Calculated Field**:
- `total_amount`: Automatically calculated as `base_amount + (base_amount * tax_rate)`

**Success Response** (201 Created):
```json
{
  "id": "cm5exp456def",
  "description": "Business lunch with client",
  "base_amount": 1500.0,
  "tax_rate": 0.18,
  "category": "Food",
  "is_reimbursed": false,
  "total_amount": 1770.0,
  "createdAt": "2025-01-05T10:30:00.000Z",
  "userId": "cm5abc123xyz"
}
```

**Error Responses**:

400 Bad Request - Missing required fields:
```json
{
  "error": "Missing required fields"
}
```

401 Unauthorized - Invalid/missing token:
```json
{
  "error": "Unauthorized"
}
```

---

### 4. List Expenses

**Endpoint**: `GET /api/expenses`

**Description**: Retrieve paginated list of user's expenses with optional filtering, searching, and sorting.

**Authentication**: Required (JWT Bearer token)

**Request Headers**:
```json
{
  "Authorization": "Bearer <your-jwt-token>"
}
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | No | 1 | Page number (minimum: 1) |
| `limit` | Integer | No | 10 | Items per page (range: 1-100) |
| `category` | String | No | - | Filter by category: Food, Travel, Office, Other |
| `is_reimbursed` | String | No | - | Filter by reimbursement status: "true" or "false" |
| `search` | String | No | - | Search in description (case-insensitive) |
| `sortBy` | String | No | createdAt | Sort field: createdAt, base_amount, description, category |
| `sortOrder` | String | No | desc | Sort direction: asc or desc |

**Example Requests**:

1. Basic pagination:
```
GET /api/expenses?page=1&limit=10
```

2. Filter by category:
```
GET /api/expenses?category=Food
```

3. Filter reimbursed expenses:
```
GET /api/expenses?is_reimbursed=true
```

4. Search description:
```
GET /api/expenses?search=lunch
```

5. Sort by amount (highest first):
```
GET /api/expenses?sortBy=base_amount&sortOrder=desc
```

6. Combined filters:
```
GET /api/expenses?category=Travel&is_reimbursed=false&sortBy=base_amount&sortOrder=desc&page=1&limit=20
```

**Success Response** (200 OK):
```json
{
  "expenses": [
    {
      "id": "cm5exp456def",
      "description": "Business lunch with client",
      "base_amount": 1500.0,
      "tax_rate": 0.18,
      "category": "Food",
      "is_reimbursed": false,
      "total_amount": 1770.0,
      "createdAt": "2025-01-05T10:30:00.000Z",
      "userId": "cm5abc123xyz"
    },
    {
      "id": "cm5exp789ghi",
      "description": "Flight to Mumbai",
      "base_amount": 8500.0,
      "tax_rate": 0.05,
      "category": "Travel",
      "is_reimbursed": true,
      "total_amount": 8925.0,
      "createdAt": "2025-01-04T14:20:00.000Z",
      "userId": "cm5abc123xyz"
    }
  ],
  "pagination": {
    "totalExpenses": 25,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Responses**:

400 Bad Request - Invalid parameters:
```json
{
  "error": "Invalid page or limit parameter"
}
```

401 Unauthorized:
```json
{
  "error": "Unauthorized"
}
```

---

### 5. Get Single Expense

**Endpoint**: `GET /api/expenses/[id]`

**Description**: Retrieve details of a specific expense by ID.

**Authentication**: Required (JWT Bearer token)

**Request Headers**:
```json
{
  "Authorization": "Bearer <your-jwt-token>"
}
```

**URL Parameters**:
- `id`: Expense ID (string)

**Example Request**:
```
GET /api/expenses/cm5exp456def
```

**Success Response** (200 OK):
```json
{
  "id": "cm5exp456def",
  "description": "Business lunch with client",
  "base_amount": 1500.0,
  "tax_rate": 0.18,
  "category": "Food",
  "is_reimbursed": false,
  "total_amount": 1770.0,
  "createdAt": "2025-01-05T10:30:00.000Z",
  "userId": "cm5abc123xyz"
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Expense not found"
}
```

401 Unauthorized - Not owned by user:
```json
{
  "error": "Unauthorized"
}
```

---

### 6. Update Expense

**Endpoint**: `PUT /api/expenses/[id]`

**Description**: Update an existing expense.

**Authentication**: Required (JWT Bearer token)

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your-jwt-token>"
}
```

**URL Parameters**:
- `id`: Expense ID (string)

**Request Body** (all fields optional):
```json
{
  "description": "Updated business lunch",
  "base_amount": 1800.00,
  "tax_rate": 0.18,
  "category": "Food",
  "is_reimbursed": true
}
```

**Example Request**:
```
PUT /api/expenses/cm5exp456def
```

**Success Response** (200 OK):
```json
{
  "id": "cm5exp456def",
  "description": "Updated business lunch",
  "base_amount": 1800.0,
  "tax_rate": 0.18,
  "category": "Food",
  "is_reimbursed": true,
  "total_amount": 2124.0,
  "createdAt": "2025-01-05T10:30:00.000Z",
  "userId": "cm5abc123xyz"
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Expense not found"
}
```

401 Unauthorized:
```json
{
  "error": "Unauthorized"
}
```

---

### 7. Delete Expense

**Endpoint**: `DELETE /api/expenses/[id]`

**Description**: Delete an expense permanently.

**Authentication**: Required (JWT Bearer token)

**Request Headers**:
```json
{
  "Authorization": "Bearer <your-jwt-token>"
}
```

**URL Parameters**:
- `id`: Expense ID (string)

**Example Request**:
```
DELETE /api/expenses/cm5exp456def
```

**Success Response** (200 OK):
```json
{
  "message": "Expense deleted successfully"
}
```

**Error Responses**:

404 Not Found:
```json
{
  "error": "Expense not found"
}
```

401 Unauthorized:
```json
{
  "error": "Unauthorized"
}
```

---

## Data Models

### User Model
```javascript
{
  id: String (CUID),
  email: String (unique),
  password: String (bcrypt hashed),
  expenses: Expense[] (relation),
  createdAt: DateTime
}
```

### Expense Model
```javascript
{
  id: String (CUID),
  description: String,
  base_amount: Float,
  tax_rate: Float,
  category: Enum (Food, Travel, Office, Other),
  is_reimbursed: Boolean,
  total_amount: Float (calculated),
  createdAt: DateTime,
  userId: String (foreign key),
  user: User (relation)
}
```

---

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or parameters |
| 401 | Unauthorized - Authentication required or failed |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists (duplicate) |
| 500 | Internal Server Error - Server-side error |

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description":"Lunch",
    "base_amount":500,
    "tax_rate":0.18,
    "category":"Food",
    "is_reimbursed":false
  }'
```

### List Expenses with Filters
```bash
curl -X GET "http://localhost:3000/api/expenses?page=1&limit=10&category=Food&sortBy=base_amount&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Expense
```bash
curl -X PUT http://localhost:3000/api/expenses/EXPENSE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"is_reimbursed":true}'
```

### Delete Expense
```bash
curl -X DELETE http://localhost:3000/api/expenses/EXPENSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting to prevent abuse.

---

## Security Considerations

1. **Password Security**: All passwords are hashed using bcrypt (10 salt rounds)
2. **JWT Secret**: Store JWT_SECRET in environment variables, never commit to version control
3. **HTTPS**: Always use HTTPS in production to protect tokens in transit
4. **Token Storage**: Store tokens securely (HttpOnly cookies recommended for production)
5. **Input Validation**: All inputs are validated and sanitized
6. **SQL Injection**: Protected by Prisma ORM's parameterized queries

---

## Postman Collection

Import this collection into Postman for easy API testing:

1. Create a new collection named "Expensify API"
2. Add environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: Your JWT token (set after login)
3. Import all endpoints listed above
4. Use `{{base_url}}` and `{{token}}` variables in requests

---

## Version History

- **v1.0.0** (2025-01-05): Initial release with authentication, CRUD operations, pagination, filtering, search, and sorting
