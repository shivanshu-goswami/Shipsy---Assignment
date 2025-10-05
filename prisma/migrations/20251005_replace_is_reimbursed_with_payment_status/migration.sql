-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Paid', 'Pending', 'Reimbursable', 'Recurring');

-- Add new payment_status column with default value
ALTER TABLE "Expense" ADD COLUMN "payment_status" "PaymentStatus" NOT NULL DEFAULT 'Pending';

-- Migrate existing data: If is_reimbursed is true, set to 'Paid', otherwise 'Pending'
UPDATE "Expense" SET "payment_status" = CASE 
  WHEN "is_reimbursed" = true THEN 'Paid'::"PaymentStatus"
  ELSE 'Pending'::"PaymentStatus"
END;

-- Drop the old column
ALTER TABLE "Expense" DROP COLUMN "is_reimbursed";
