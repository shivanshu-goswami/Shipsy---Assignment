# 💰 Expensify - Expense Tracking Application
## LOGIN CREDENTIAL : Gmail id -> goswamishivanshu47@gmail.com , Password -> 123456

A modern, full-stack expense tracking application built with Next.js, Prisma, and PostgreSQL. Manage your expenses with ease, featuring authentication, CRUD operations, advanced filtering, search, and sorting capabilities.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

### Core Functionality
- 🔐 **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- ✅ **Full CRUD Operations**: Create, Read, Update, Delete expenses
- 📊 **Calculated Field**: Automatic total amount calculation (base amount + tax)
- 🏷️ **Category System**: Food, Travel, Office, Other
- ✔️ **Reimbursement Tracking**: Track which expenses have been reimbursed

### Advanced Features (Bonus)
- 🔍 **Search**: Search expenses by description (case-insensitive)
- 🔄 **Sorting**: Sort by date, amount, description, or category (ascending/descending)
- 🎯 **Filtering**: Filter by category and reimbursement status
- 📄 **Pagination**: Navigate through expenses with page controls
- 🎨 **Beautiful UI**: Modern design with gradients, emojis, and smooth animations

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **PostgreSQL Database**: We recommend [Supabase](https://supabase.com/) for free hosting

Check your versions:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

### Installation

1. **Clone the repository** (or extract the ZIP file):
```bash
git clone <repository-url>
cd expensify
```

2. **Install dependencies**:
```bash
npm install
```

Expected output:
```
added 352 packages, and audited 353 packages in 45s
found 0 vulnerabilities
```

3. **Set up environment variables**:

Create a `.env` file in the root directory:
```bash
# Windows PowerShell
New-Item -Path . -Name ".env" -ItemType "file"

# Or just create it manually
```

Add the following content to `.env`:
```env
# Database URLs (Get these from Supabase)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-secret-key-here"
```

**How to get database URLs:**
- Sign up at [Supabase](https://supabase.com/)
- Create a new project
- Go to Project Settings → Database
- Copy the "Connection String" (URI format)
- For `DATABASE_URL`: Use the connection pooling URL (port 6543) with `?pgbouncer=true`
- For `DIRECT_URL`: Use the direct connection URL (port 5432)

**How to generate JWT_SECRET:**
```bash
# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use an online generator: https://randomkeygen.com/
```

4. **Run Prisma migrations**:
```bash
npx prisma migrate dev --name init
```

Expected output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database

Applying migration `20251005120303_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251005120303_init/
    └─ migration.sql

✔ Generated Prisma Client (v6.16.3)
```

This will:
- Create the database tables (User, Expense)
- Generate the Prisma Client
- Set up the Category enum

5. **Verify Prisma setup**:
```bash
npx prisma studio
```

This opens a browser-based database GUI at `http://localhost:5555`. You should see empty `User` and `Expense` tables.

6. **Start the development server**:
```bash
npm run dev
```

Expected output:
```
> expensify@0.1.0 dev
> next dev

  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 3.2s
```

7. **Open your browser**:

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Expensify landing page! 🎉

## 📖 Usage Guide

### 1. Register an Account

1. Click **"Get Started"** or **"Sign Up"** on the homepage
2. Enter your email and password
3. Click **"Sign Up"**
4. You'll be automatically logged in and redirected to the dashboard

### 2. Create Your First Expense

In the dashboard:

1. Fill out the form:
   - **Description**: e.g., "Business lunch with client"
   - **Base Amount**: e.g., 1500 (in your currency)
   - **Tax Rate**: e.g., 0.18 (for 18%)
   - **Category**: Choose from Food 🍔, Travel ✈️, Office 🏢, or Other 📦
   - **Is Reimbursed**: Check if already reimbursed
2. Click **"➕ Create Expense"**
3. See your expense appear in the table with calculated total amount!

**Example**:
```
Description: Business lunch
Base Amount: ₹1500
Tax Rate: 0.18 (18%)
Total Amount: ₹1770 (automatically calculated)
```

### 3. Search and Filter

**Search by description**:
- Type in the search box: "lunch"
- Results update instantly

**Filter by category**:
- Select "Food" from the Category dropdown
- See only food-related expenses

**Filter by status**:
- Select "Reimbursed" or "Pending"
- Track what needs to be claimed

### 4. Sort Your Expenses

Choose from the dropdown:
- **Date**: Show newest or oldest first
- **Base Amount**: Highest or lowest expenses
- **Description**: Alphabetical order
- **Category**: Group by category

Select order (Ascending ⬆️ or Descending ⬇️)

### 5. Navigate Pages

If you have more than 10 expenses:
- Click **"Next →"** to see the next page
- Click **"← Previous"** to go back
- See total count: "Showing page 2 of 5 (45 total expenses)"

### 6. Edit an Expense

1. Click the **"✏️ Edit"** button on any expense
2. Form fills with current data
3. Modify any fields
4. Click **"💾 Update Expense"**

### 7. Delete an Expense

1. Click the **"🗑️ Delete"** button
2. Confirm in the popup dialog
3. Expense is permanently removed

### 8. Logout

Click **"Logout"** in the top-right corner to sign out securely.

## 🛠️ Development

### Project Structure

```
expensify/
├── app/
│   ├── api/              # API routes (serverless functions)
│   │   ├── auth/
│   │   │   ├── login/route.js     # POST /api/auth/login
│   │   │   └── register/route.js  # POST /api/auth/register
│   │   └── expenses/
│   │       ├── route.js           # POST, GET /api/expenses
│   │       └── [id]/route.js      # GET, PUT, DELETE /api/expenses/[id]
│   ├── dashboard/page.jsx         # Main application UI
│   ├── login/page.jsx             # Login form
│   ├── register/page.jsx          # Registration form
│   ├── page.jsx                   # Landing page
│   ├── layout.jsx                 # Root layout
│   └── globals.css                # Global styles
├── lib/
│   └── prisma.js         # Prisma Client singleton
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── docs/
│   ├── API_DOCUMENTATION.md   # Complete API reference
│   └── ARCHITECTURE.md        # System architecture details
├── .env                  # Environment variables (DO NOT COMMIT)
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.mjs   # Tailwind CSS configuration
└── README.md             # This file
```

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Open Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Database Management

**View your database**:
```bash
npx prisma studio
```

**Create a new migration** (after changing `schema.prisma`):
```bash
npx prisma migrate dev --name add_new_field
```

**Reset database** (useful for development):
```bash
npx prisma migrate reset
```

**Push schema changes without migration** (development only):
```bash
npx prisma db push
```

## 📡 API Documentation

Comprehensive API documentation is available in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

### Quick API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/expenses` | List expenses (paginated) | Yes |
| POST | `/api/expenses` | Create expense | Yes |
| GET | `/api/expenses/[id]` | Get single expense | Yes |
| PUT | `/api/expenses/[id]` | Update expense | Yes |
| DELETE | `/api/expenses/[id]` | Delete expense | Yes |

**Authentication**: Include JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Example API Call (cURL)

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create Expense
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

## 🏗️ Architecture

Detailed system architecture is available in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

### Technology Stack

- **Frontend**: Next.js 15 (React 19) with App Router
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 6.16.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcrypt 6.0.0

### Database Schema

```
User
├── id: String (Primary Key)
├── email: String (Unique)
├── password: String (Hashed)
└── expenses: Expense[] (Relation)

Expense
├── id: String (Primary Key)
├── description: String
├── base_amount: Float
├── tax_rate: Float
├── category: Enum (Food, Travel, Office, Other)
├── is_reimbursed: Boolean
├── total_amount: Float (Calculated)
├── createdAt: DateTime
└── userId: String (Foreign Key)
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `JWT_SECRET`
   - Click "Deploy"

3. **Run migrations on production**:
```bash
# After deployment, go to Vercel dashboard
# → Project → Settings → General → Build & Development Settings
# → Build Command: npx prisma migrate deploy && next build
```

Your app will be live at `https://your-app-name.vercel.app`!

### Deploy to Render

1. **Create a new Web Service** on [render.com](https://render.com/)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
4. Add environment variables (same as Vercel)
5. Click "Create Web Service"

### Environment Variables for Production

```env
DATABASE_URL="<your-production-postgres-url>"
DIRECT_URL="<your-production-direct-url>"
JWT_SECRET="<strong-random-secret-different-from-dev>"
NODE_ENV="production"
```

⚠️ **Important**: Use different JWT secrets for development and production!

## 🧪 Testing

### Manual Testing Checklist

- [ ] Register a new user
- [ ] Login with created user
- [ ] Create an expense with all fields
- [ ] Verify total_amount calculation
- [ ] Edit an existing expense
- [ ] Delete an expense
- [ ] Test pagination (create 15+ expenses)
- [ ] Test category filter
- [ ] Test reimbursement filter
- [ ] Test search functionality
- [ ] Test sorting by different fields
- [ ] Test sorting ascending/descending
- [ ] Logout and verify redirect to login

### Test with Prisma Studio

```bash
npx prisma studio
```

1. Open the `Expense` table
2. Verify `total_amount` is calculated correctly:
   - Formula: `base_amount + (base_amount × tax_rate)`
   - Example: Base 1000, Tax 0.18 → Total should be 1180

## 🐛 Troubleshooting

### Common Issues

**1. "Port 3000 is already in use"**

Solution:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Start server again
npm run dev
```

**2. "Prisma Client not generated"**

Solution:
```bash
npx prisma generate
```

**3. "Cannot connect to database"**

Check:
- `.env` file exists in root directory
- `DATABASE_URL` and `DIRECT_URL` are correct
- Database is accessible (check Supabase dashboard)
- Firewall isn't blocking the connection

Solution:
```bash
# Test connection
npx prisma db pull
```

**4. "JWT malformed" or "Unauthorized"**

Solutions:
- Clear localStorage and login again
- Check if `JWT_SECRET` in `.env` matches what was used to create the token
- Verify token is being sent in Authorization header

**5. "Text not visible in forms"**

This has been fixed! If you see white text on white background:
- Check `text-gray-900` class is applied to all inputs
- Clear browser cache and hard refresh (Ctrl+Shift+R)

**6. "Module not found: @/app/generated/prisma"**

Solution:
```bash
npx prisma generate
npm run dev
```

### Reset Everything

If you want to start fresh:

```bash
# Delete node_modules and lockfile
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Delete Prisma generated files
Remove-Item -Recurse -Force app\generated

# Delete .next build cache
Remove-Item -Recurse -Force .next

# Reinstall
npm install
npx prisma generate
npx prisma migrate reset  # WARNING: Deletes all data!
npm run dev
```

## 📝 Assignment Compliance

This project fulfills all requirements of the AI Campus Assignment:

### Mandatory Requirements ✅

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| User authentication | ✅ | JWT + bcrypt authentication |
| CRUD operations | ✅ | Full Create, Read, Update, Delete for expenses |
| Prisma ORM | ✅ | Prisma 6.16.3 with PostgreSQL |
| Text field | ✅ | `description` field (String) |
| Boolean field | ✅ | `is_reimbursed` field (Boolean) |
| Enum field | ✅ | `category` field (Food, Travel, Office, Other) |
| Calculated field | ✅ | `total_amount = base_amount + (base_amount × tax_rate)` |
| Pagination | ✅ | Page and limit parameters with metadata |
| Filtering | ✅ | Filter by category and reimbursement status |

### Bonus Features ✅

| Bonus Requirement | Status | Implementation |
|-------------------|--------|----------------|
| Sorting | ✅ | Sort by date, amount, description, category (asc/desc) |
| Search | ✅ | Search by description (case-insensitive) |

### Documentation ✅

| Document | Status | Location |
|----------|--------|----------|
| API Documentation | ✅ | [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) |
| Architecture Documentation | ✅ | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Setup Instructions (README) | ✅ | This file |
| Demo Video Outline | ✅ | [`docs/DEMO_VIDEO.md`](docs/DEMO_VIDEO.md) |

## 🎥 Demo Video

A structured outline for creating a demo video is available in [`docs/DEMO_VIDEO.md`](docs/DEMO_VIDEO.md).

The video should demonstrate:
1. User registration and login
2. Creating expenses with different categories
3. Viewing the calculated total_amount field
4. Using pagination controls
5. Filtering by category and status
6. Searching for expenses
7. Sorting by different fields

## 🤝 Contributing

This is an assignment project, but if you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for educational purposes as part of the AI Campus Assignment.

## 👨‍💻 Author

Created with ❤️ for AI Campus Assignment

## 📧 Support

For questions or issues:
- Check the [Troubleshooting](#-troubleshooting) section
- Review the [API Documentation](docs/API_DOCUMENTATION.md)
- Review the [Architecture Documentation](docs/ARCHITECTURE.md)

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT.io](https://jwt.io/) - Decode and verify JWT tokens

---

**Happy Expense Tracking! 💰✨**

