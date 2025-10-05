# Expensify - System Architecture Documentation

## 1. Overview

Expensify is a full-stack expense tracking application built with modern web technologies. The application follows a client-server architecture with a Next.js frontend and backend, PostgreSQL database managed through Prisma ORM, and JWT-based authentication.

### Technology Stack

- **Frontend**: Next.js 15.5.4 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.16.3
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0
- **Deployment**: Vercel-ready (can also deploy to Render, Railway, etc.)

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React Components)                        │
│  ├── app/page.jsx (Landing Page)                           │
│  ├── app/login/page.jsx (Login Form)                       │
│  ├── app/register/page.jsx (Registration Form)             │
│  └── app/dashboard/page.jsx (Main Application)             │
│                                                              │
│  State Management: React Hooks (useState, useCallback)      │
│  Styling: Tailwind CSS with custom gradients               │
│  Storage: localStorage (JWT token)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                         HTTP/HTTPS
                       (JSON + JWT)
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Serverless Functions)                  │
│  ├── /api/auth/register (POST)                             │
│  ├── /api/auth/login (POST)                                │
│  ├── /api/expenses (POST, GET)                             │
│  └── /api/expenses/[id] (GET, PUT, DELETE)                 │
│                                                              │
│  Middleware: JWT Verification                               │
│  Business Logic: CRUD operations, Calculations              │
│  Validation: Input sanitization and type checking           │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                      Prisma Client
                      (Type-safe ORM)
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                         DATA TIER                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (Supabase)                             │
│  ├── User Table                                             │
│  │   ├── id (Primary Key)                                  │
│  │   ├── email (Unique)                                    │
│  │   ├── password (Hashed)                                 │
│  │   └── createdAt                                         │
│  │                                                          │
│  └── Expense Table                                          │
│      ├── id (Primary Key)                                  │
│      ├── description (Text)                                │
│      ├── base_amount (Float)                               │
│      ├── tax_rate (Float)                                  │
│      ├── category (Enum)                                   │
│      ├── is_reimbursed (Boolean)                           │
│      ├── total_amount (Calculated: base × (1 + tax))      │
│      ├── createdAt                                         │
│      └── userId (Foreign Key → User.id)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Entity-Relationship Diagram

```
┌─────────────────────────┐
│         User            │
├─────────────────────────┤
│ id: String (PK)         │
│ email: String (UNIQUE)  │
│ password: String        │
│ createdAt: DateTime     │
└────────────┬────────────┘
             │
             │ 1:N (One-to-Many)
             │
             ↓
┌─────────────────────────┐
│       Expense           │
├─────────────────────────┤
│ id: String (PK)         │
│ description: String     │
│ base_amount: Float      │
│ tax_rate: Float         │
│ category: Category      │
│ is_reimbursed: Boolean  │
│ total_amount: Float     │
│ createdAt: DateTime     │
│ userId: String (FK)     │
└─────────────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  Category = Enum{Food, Travel, Office, Other}
```

### Prisma Schema Definition

**File**: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

enum Category {
  Food
  Travel
  Office
  Other
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  expenses  Expense[]
  createdAt DateTime @default(now())
}

model Expense {
  id             String   @id @default(cuid())
  description    String
  base_amount    Float
  tax_rate       Float
  category       Category
  is_reimbursed  Boolean
  total_amount   Float
  createdAt      DateTime @default(now())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Key Schema Features

1. **CUID Primary Keys**: Collision-resistant IDs for distributed systems
2. **Cascade Deletion**: Deleting a user removes all their expenses
3. **Calculated Field**: `total_amount` stored in DB, calculated as `base_amount + (base_amount * tax_rate)`
4. **Enum Type**: Type-safe category field with 4 predefined values
5. **Unique Constraint**: Email uniqueness enforced at database level

---

## 4. Module Breakdown

### 4.1 Database Layer (`lib/prisma.js`)

**Purpose**: Singleton Prisma Client instance for database operations

**Pattern**: Singleton pattern prevents multiple client instances in development hot-reload

```javascript
import { PrismaClient } from '@/app/generated/prisma';

// Singleton pattern for development hot-reload
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
```

**Benefits**:
- Prevents connection pool exhaustion
- Ensures single client across API routes
- Optimizes performance in serverless environment

---

### 4.2 Authentication Module (`app/api/auth/`)

#### Registration (`register/route.js`)

**Responsibilities**:
- Validate email and password
- Check for existing users
- Hash password with bcrypt (10 salt rounds)
- Create user in database

**Security Features**:
- Password hashing before storage
- Duplicate email prevention
- Input validation

**Flow**:
```
Client Request
    ↓
Validate Input (email, password)
    ↓
Check if User Exists
    ↓ (No)
Hash Password (bcrypt)
    ↓
Create User in DB
    ↓
Return User Object (excluding password)
```

#### Login (`login/route.js`)

**Responsibilities**:
- Validate credentials
- Compare hashed passwords
- Generate JWT token
- Return token and user data

**Security Features**:
- Bcrypt password comparison
- JWT with 1-day expiration
- User data in token payload

**JWT Payload Structure**:
```javascript
{
  userId: "cm5abc123xyz",
  email: "user@example.com",
  iat: 1704441600,  // Issued at timestamp
  exp: 1704528000   // Expiration timestamp
}
```

---

### 4.3 Expense Management Module (`app/api/expenses/`)

#### Create & List Expenses (`route.js`)

**POST /api/expenses**:
- **Authentication**: Extract JWT from Authorization header
- **Authorization**: Verify token and extract userId
- **Validation**: Check required fields (description, base_amount, tax_rate, category, is_reimbursed)
- **Calculation**: Compute total_amount = base_amount + (base_amount × tax_rate)
- **Persistence**: Create expense record linked to authenticated user

**GET /api/expenses**:
- **Authentication**: JWT verification
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
  - `category` (optional filter)
  - `is_reimbursed` (optional filter: "true"/"false")
  - `search` (optional: description contains, case-insensitive)
  - `sortBy` (default: "createdAt", options: createdAt, base_amount, description, category)
  - `sortOrder` (default: "desc", options: asc/desc)
- **Processing**:
  1. Build Prisma where clause from filters
  2. Apply search with case-insensitive matching
  3. Calculate pagination offsets
  4. Execute query with orderBy
  5. Count total matching records
  6. Return expenses with pagination metadata

**Pagination Response**:
```javascript
{
  expenses: [...],
  pagination: {
    totalExpenses: 45,
    totalPages: 5,
    currentPage: 2,
    limit: 10,
    hasNextPage: true,
    hasPrevPage: true
  }
}
```

#### Individual Expense Operations (`[id]/route.js`)

**GET /api/expenses/[id]**:
- Fetch single expense by ID
- Verify ownership (userId matches token)
- Return expense details

**PUT /api/expenses/[id]**:
- Extract update fields from request body
- Recalculate total_amount if base_amount or tax_rate changed
- Update expense record
- Verify ownership before update

**DELETE /api/expenses/[id]**:
- Verify ownership
- Delete expense from database
- Return success message

**Authorization Helper Function**:
```javascript
async function getUserIdFromToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
```

---

### 4.4 Frontend Components

#### Landing Page (`app/page.jsx`)

**Purpose**: Marketing page with feature highlights

**Features**:
- Hero section with call-to-action
- Feature cards (Smart Tracking, Easy Management, Detailed Reports)
- Navigation to login/register pages

**Design**: Gradient backgrounds, emoji icons, responsive grid layout

---

#### Authentication Pages

**Login Page (`app/login/page.jsx`)**:
- Email/password form
- JWT token storage in localStorage
- Redirect to dashboard on success
- Link to registration page

**Register Page (`app/register/page.jsx`)**:
- Email/password/confirm password form
- Client-side password matching validation
- Automatic login after registration
- Link to login page

**Token Storage Pattern**:
```javascript
// After successful authentication
localStorage.setItem('token', response.token);
router.push('/dashboard');

// On component mount
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) router.push('/login');
}, []);
```

---

#### Dashboard (`app/dashboard/page.jsx`)

**Architecture**: Single-page application with real-time CRUD operations

**State Management**:
```javascript
// Expense data
const [expenses, setExpenses] = useState([]);
const [loading, setLoading] = useState(true);

// Form state
const [formData, setFormData] = useState({...});
const [currentExpense, setCurrentExpense] = useState(null);

// Search and filters
const [searchQuery, setSearchQuery] = useState('');
const [filterCategory, setFilterCategory] = useState('');
const [filterReimbursed, setFilterReimbursed] = useState('');

// Sorting
const [sortBy, setSortBy] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState(null);

// UI feedback
const [error, setError] = useState('');
const [successMessage, setSuccessMessage] = useState('');
```

**Key Functions**:

1. **fetchExpenses()**: 
   - useCallback hook with dependency array
   - Builds query string from state
   - Makes authenticated GET request
   - Updates expenses and pagination state

2. **handleSubmit()**:
   - Determines POST (create) vs PUT (update)
   - Calculates total_amount client-side for display
   - Sends request with JWT token
   - Shows success message, resets form
   - Refreshes expense list

3. **handleEdit()**:
   - Populates form with selected expense
   - Sets currentExpense for update mode
   - Scrolls to form section

4. **handleDelete()**:
   - Shows confirmation dialog
   - Makes DELETE request
   - Removes from UI immediately
   - Shows success message

**UI Sections**:
- Header with logout button
- Form section (Create/Edit expense)
- Search bar
- Filter dropdowns (Category, Status)
- Sort controls (Sort By, Order)
- Expense table with hover effects
- Pagination controls (Previous/Next buttons)

**Responsive Design**:
- Grid layout: 1 column (mobile), 3 columns (desktop)
- Form in left column (1/3 width)
- Expense list in right column (2/3 width)

---

## 5. Data Flow Examples

### Example 1: Creating an Expense

```
1. User fills form and clicks "Create Expense"
   ↓
2. handleSubmit() triggered
   ↓
3. Extract formData from state
   ↓
4. POST /api/expenses with Authorization header
   ↓
5. API route verifies JWT token
   ↓
6. Extract userId from token
   ↓
7. Calculate total_amount = base_amount + (base_amount × tax_rate)
   ↓
8. Prisma.expense.create() with userId
   ↓
9. Database INSERT operation
   ↓
10. Return created expense with ID
    ↓
11. Dashboard shows success message
    ↓
12. fetchExpenses() called to refresh list
    ↓
13. Table updated with new expense
```

### Example 2: Filtering and Searching

```
1. User types "lunch" in search box
   ↓
2. setSearchQuery('lunch') updates state
   ↓
3. useEffect triggers fetchExpenses()
   ↓
4. Build query: ?search=lunch&page=1&limit=10
   ↓
5. GET /api/expenses?search=lunch
   ↓
6. API builds Prisma where clause:
   {
     userId: "abc123",
     description: {
       contains: "lunch",
       mode: "insensitive"
     }
   }
   ↓
7. Prisma executes SQL: WHERE description ILIKE '%lunch%'
   ↓
8. Return filtered expenses
   ↓
9. Dashboard updates table with results
```

### Example 3: Pagination

```
1. User clicks "Next" button
   ↓
2. setCurrentPage(prev => prev + 1)
   ↓
3. fetchExpenses() triggered by useEffect
   ↓
4. Build query: ?page=2&limit=10
   ↓
5. API calculates skip = (2 - 1) × 10 = 10
   ↓
6. Prisma query:
   findMany({
     where: {...},
     skip: 10,
     take: 10,
     orderBy: {...}
   })
   ↓
7. Return expenses 11-20
   ↓
8. Update pagination metadata:
   {
     currentPage: 2,
     totalPages: 5,
     hasNextPage: true,
     hasPrevPage: true
   }
   ↓
9. Dashboard renders new page with updated buttons
```

---

## 6. Security Architecture

### Authentication Flow

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 1. POST /auth/login
      │    {email, password}
      ↓
┌─────────────────────┐
│   Login API Route   │
├─────────────────────┤
│ 2. Fetch user       │
│ 3. bcrypt.compare() │
│ 4. jwt.sign()       │
└──────┬──────────────┘
       │
       │ 5. Return JWT token
       ↓
┌────────────┐
│   Client   │
├────────────┤
│ 6. Store   │
│ localStorage│
└─────┬──────┘
      │
      │ 7. Subsequent requests
      │    Authorization: Bearer <token>
      ↓
┌─────────────────────┐
│  Protected Route    │
├─────────────────────┤
│ 8. Verify JWT       │
│ 9. Extract userId   │
│ 10. Process request │
└─────────────────────┘
```

### Security Measures

1. **Password Security**:
   - bcrypt hashing with 10 salt rounds
   - Never store plain text passwords
   - Never return passwords in API responses

2. **Token Security**:
   - JWT with HS256 algorithm
   - 1-day expiration (86400 seconds)
   - Stored in localStorage (consider HttpOnly cookies for production)

3. **Authorization**:
   - Every expense operation verifies ownership
   - Users can only access their own expenses
   - SQL injection prevented by Prisma's parameterized queries

4. **Input Validation**:
   - Required field checks
   - Type validation (Float, Boolean, Enum)
   - Range validation (tax_rate: 0-1, limit: 1-100)
   - Whitelist validation for sortBy field

5. **Database Security**:
   - Connection pooling via Supabase
   - Environment variable configuration
   - Cascade deletion prevents orphaned records

---

## 7. Performance Optimizations

1. **Prisma Client Singleton**: Prevents connection pool exhaustion
2. **Pagination**: Limits query size to 10-100 records
3. **Indexed Fields**: Primary keys and foreign keys automatically indexed
4. **Selective Queries**: Prisma only fetches requested fields
5. **useCallback Hook**: Prevents unnecessary re-renders in React
6. **Lazy Loading**: Components load data on mount, not on navigation

---

## 8. Deployment Architecture

### Vercel Deployment (Recommended)

```
┌──────────────────────────────────────────┐
│         Vercel Edge Network              │
│  ┌────────────────────────────────────┐  │
│  │   CDN (Static Assets)              │  │
│  │   - globals.css                    │  │
│  │   - Next.js client bundles         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   Serverless Functions             │  │
│  │   - /api/auth/register             │  │
│  │   - /api/auth/login                │  │
│  │   - /api/expenses                  │  │
│  │   - /api/expenses/[id]             │  │
│  └────────────────────────────────────┘  │
└───────────────┬──────────────────────────┘
                │
                │ Prisma Connection
                ↓
┌──────────────────────────────────────────┐
│      Supabase PostgreSQL Database         │
│  - Connection pooling enabled             │
│  - Auto-scaling                           │
│  - Backups and replication                │
└──────────────────────────────────────────┘
```

### Environment Variables

**Production Requirements**:
```env
DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="<secure-random-secret-256-bits>"
NODE_ENV="production"
```

**Security Notes**:
- Never commit `.env` to version control
- Use Vercel's environment variable dashboard
- Rotate JWT_SECRET periodically
- Use different secrets for dev/staging/production

---

## 9. Future Enhancements

### Potential Improvements

1. **Caching Layer**:
   - Redis for frequently accessed data
   - Reduce database queries

2. **Rate Limiting**:
   - Prevent API abuse
   - Implement per-user quotas

3. **Real-time Updates**:
   - WebSocket integration
   - Multi-device synchronization

4. **Analytics Dashboard**:
   - Expense trends and charts
   - Category-wise spending analysis
   - Monthly/yearly reports

5. **File Uploads**:
   - Receipt image storage (AWS S3/Cloudinary)
   - OCR for automatic expense entry

6. **Export Functionality**:
   - CSV/Excel export
   - PDF reports with charts

7. **Multi-currency Support**:
   - Currency conversion API integration
   - Base currency per user

8. **Team/Organization Features**:
   - Shared expense pools
   - Approval workflows
   - Role-based access control

---

## 10. Conclusion

The Expensify application demonstrates a modern, scalable architecture using industry-standard tools and best practices. The separation of concerns (frontend, API, database) allows for independent scaling and maintenance. The authentication system ensures secure access, while the comprehensive API supports advanced querying, filtering, and pagination capabilities.

The system is production-ready and can be easily deployed to Vercel or similar platforms with minimal configuration. The Prisma ORM provides type safety and prevents common SQL injection vulnerabilities, while the JWT-based authentication ensures secure, stateless session management.
