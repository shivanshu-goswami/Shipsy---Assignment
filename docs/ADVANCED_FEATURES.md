# Advanced Features Documentation

## Filters & Pagination Implementation

This document covers the advanced filtering and pagination system implemented in the Expensify application.

### 📊 Overview

The expense listing system includes:
- **Pagination**: Page-based navigation with metadata
- **Filtering**: Category and payment status filters
- **Search**: Description text search (case-insensitive)
- **Sorting**: Multiple field sorting with ascending/descending order
- **Combined Operations**: All features work together seamlessly

---

## 🔍 Filtering System

### Category Filter
Filter expenses by predefined categories:
- 🍔 **Food** - Restaurant, groceries, meals
- ✈️ **Travel** - Flights, hotels, transportation
- 🏢 **Office** - Office supplies, software, equipment
- 📦 **Other** - Miscellaneous expenses

**API Usage**:
```
GET /api/expenses?category=Food
GET /api/expenses?category=Travel
```

### Payment Status Filter
Filter by payment/reimbursement status:
- ✅ **Paid** - Expense has been paid
- ⏳ **Pending** - Awaiting payment
- 💰 **Reimbursable** - Can be reimbursed
- 🔄 **Recurring** - Subscription/recurring expense

**API Usage**:
```
GET /api/expenses?payment_status=Paid
GET /api/expenses?payment_status=Pending
```

### Search Functionality
Search expenses by description text:
- Case-insensitive search
- Partial text matching
- Uses PostgreSQL `ILIKE` operator

**API Usage**:
```
GET /api/expenses?search=lunch
GET /api/expenses?search=client meeting
```

---

## 📄 Pagination System

### Implementation Details
- **Page-based pagination** (not cursor-based)
- **Configurable page size** (default: 10 items)
- **Complete metadata** for UI controls
- **Performance optimized** with SQL LIMIT/OFFSET

### Pagination Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Current page number (1-indexed) |
| `limit` | integer | 10 | Items per page (5, 10, 20, 50) |

### Pagination Metadata Response
```json
{
  "expenses": [...],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalExpenses": 47,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### API Usage Examples
```
GET /api/expenses?page=1&limit=10
GET /api/expenses?page=2&limit=20
GET /api/expenses?page=3&limit=5
```

---

## 🔄 Sorting System

### Available Sort Fields
- **createdAt** - Date created (default)
- **base_amount** - Base amount before tax
- **total_amount** - Total amount including tax
- **description** - Expense description (alphabetical)
- **category** - Category name (alphabetical)

### Sort Orders
- **desc** - Descending (newest/highest first) - default
- **asc** - Ascending (oldest/lowest first)

### API Usage Examples
```
GET /api/expenses?sortBy=base_amount&sortOrder=desc
GET /api/expenses?sortBy=createdAt&sortOrder=asc
GET /api/expenses?sortBy=description&sortOrder=asc
```

---

## 🔗 Combined Operations

All filtering, pagination, and sorting can be combined in a single request:

### Complex Query Examples

**1. Food expenses, paid status, sorted by amount, page 2:**
```
GET /api/expenses?category=Food&payment_status=Paid&sortBy=base_amount&sortOrder=desc&page=2&limit=20
```

**2. Travel expenses with "hotel" in description:**
```
GET /api/expenses?category=Travel&search=hotel&sortBy=createdAt&sortOrder=desc
```

**3. All pending expenses, newest first:**
```
GET /api/expenses?payment_status=Pending&sortBy=createdAt&sortOrder=desc&limit=50
```

---

## 📱 Frontend Components

### ExpenseFilters Component
Reusable filter component with:
- Search input field
- Category dropdown
- Payment status dropdown
- Sort field and order selectors
- Clear all filters button
- Active filters display with remove options

**Usage:**
```jsx
import ExpenseFilters from '@/components/ExpenseFilters';

<ExpenseFilters 
  onFiltersChange={handleFiltersChange}
  initialFilters={currentFilters}
/>
```

### PaginationControls Component
Advanced pagination component with:
- Previous/Next navigation
- Page number buttons (smart pagination for many pages)
- Items per page selector
- Quick jump to page input
- First/Last page buttons (for 10+ pages)
- Comprehensive pagination info display

**Usage:**
```jsx
import PaginationControls from '@/components/PaginationControls';

<PaginationControls 
  pagination={paginationData}
  currentPage={currentPage}
  onPageChange={handlePageChange}
/>
```

---

## 🏗️ Backend Implementation

### API Endpoint Structure
```javascript
// GET /api/expenses
export async function GET(request) {
  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const payment_status = searchParams.get('payment_status');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;

  // Build where clause
  const where = { userId: userId };
  if (category) where.category = category;
  if (payment_status) where.payment_status = payment_status;
  if (search) {
    where.description = {
      contains: search,
      mode: 'insensitive'
    };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Execute query with Prisma
  const expenses = await prisma.expense.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: { user: { select: { id: true, email: true } } }
  });

  // Get total count for pagination
  const totalCount = await prisma.expense.count({ where });
  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    expenses: expensesWithCalculations,
    pagination: {
      currentPage: page,
      limit,
      totalExpenses: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}
```

---

## 📈 Performance Considerations

### Database Optimization
- **Indexed fields**: `userId`, `category`, `payment_status`, `createdAt`
- **Efficient queries**: Use of `skip` and `take` for pagination
- **Selective loading**: Only load necessary user fields with `select`

### Frontend Optimization
- **Debounced search**: Prevent excessive API calls on typing
- **Smart re-rendering**: Components only update when needed
- **URL state management**: Filters persist across page refreshes

### API Response Optimization
- **Calculated fields**: Total amounts computed in API
- **Minimal data transfer**: Only essential fields in responses
- **Proper HTTP status codes**: 200, 400, 401, 404, 500

---

## 🧪 Testing Examples

### Manual Testing Scenarios

**1. Test Basic Pagination:**
- Create 25+ expenses
- Navigate through pages
- Verify counts and page numbers

**2. Test Combined Filters:**
- Apply category + payment status filters
- Verify only matching results appear
- Test with search term added

**3. Test Edge Cases:**
- Empty search results
- Page numbers beyond range
- Invalid sort parameters

### API Testing with curl
```bash
# Test pagination
curl "http://localhost:3000/api/expenses?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test combined filters
curl "http://localhost:3000/api/expenses?category=Food&payment_status=Paid&search=lunch" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test sorting
curl "http://localhost:3000/api/expenses?sortBy=base_amount&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Future Enhancements

### Potential Improvements
1. **Date Range Filtering** - Filter by creation date range
2. **Amount Range Filtering** - Filter by expense amount ranges
3. **Advanced Search** - Search in multiple fields
4. **Saved Filter Presets** - Save frequently used filter combinations
5. **Export Filtered Data** - Download filtered results as CSV/PDF
6. **Real-time Updates** - WebSocket updates for live data
7. **Infinite Scroll** - Alternative to traditional pagination

This completes the comprehensive filtering and pagination system implementation.
