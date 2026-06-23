-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DRIVER';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "driverId" TEXT;

-- CreateIndex
CREATE INDEX "orders_driverId_idx" ON "orders"("driverId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
