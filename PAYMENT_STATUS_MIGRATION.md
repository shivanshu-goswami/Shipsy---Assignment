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

## Database Schema Design

### User Model
```prisma
model User {
  id       Int       @id @default(autoincrement())
  email    String    @unique
  password String
  expenses Expense[]
}
```

### Expense Model  
```prisma
model Expense {
  id             Int           @id @default(autoincrement())
  description    String
  base_amount    Float
  tax_rate       Float
  category       Category
  payment_status PaymentStatus @default(Pending)
  createdAt      DateTime      @default(now())
  userId         Int
  user           User          @relation(fields: [userId], references: [id])
}
```

### Enums
```prisma
enum Category {
  Food
  Travel
  Office
  Other
}

enum PaymentStatus {
  Paid
  Pending
  Reimbursable
  Recurring
}
```
