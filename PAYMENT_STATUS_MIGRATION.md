# Payment Status Migration Guide

## What Changed?

The `is_reimbursed` boolean field has been replaced with a `payment_status` enum field that supports 4 statuses:
- ✅ **Paid** - Expense has been paid
- ⏳ **Pending** - Awaiting payment
- 💰 **Reimbursable** - Can be reimbursed
- 🔄 **Recurring** - Subscription/recurring expense

## Database Migration

A migration file has been created that will:
1. Create the new `PaymentStatus` enum type
2. Add the `payment_status` column with default value 'Pending'
3. Migrate existing data:
   - `is_reimbursed = true` → `payment_status = 'Paid'`
   - `is_reimbursed = false` → `payment_status = 'Pending'`
4. Drop the old `is_reimbursed` column

## How to Apply the Migration

When your database is available, run:

```bash
npx prisma migrate deploy
```

OR if in development mode:

```bash
npx prisma migrate dev
```

## What Was Updated

### Frontend (Dashboard)
- ✅ Form: Replaced checkbox with dropdown selector
- ✅ Filter: Updated to show all 4 payment status options
- ✅ Table: Now displays colored badges for each status
- ✅ State Management: Updated to use `payment_status` instead of `is_reimbursed`

### Backend (API)
- ✅ POST `/api/expenses`: Accepts `payment_status` field
- ✅ PUT `/api/expenses/[id]`: Updates `payment_status` field
- ✅ GET `/api/expenses`: Filters by `payment_status`
- ✅ Validation: Ensures only valid status values are accepted

### Database Schema
- ✅ Prisma Schema: Updated with new `PaymentStatus` enum
- ✅ Migration: Ready to apply when database is accessible

## Testing

After migration:
1. Verify existing expenses show correct payment status
2. Create new expense with each status type
3. Test filtering by each status
4. Test editing expense status

## Rollback (If Needed)

If you need to rollback:
1. Keep a database backup before migrating
2. Revert the Prisma schema changes
3. Create a new migration to restore `is_reimbursed`
