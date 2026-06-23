-- CreateEnum
CREATE TYPE "ShippingCarrier" AS ENUM ('FEDEX', 'UPS', 'MYSTORE_DELIVERY', 'OTHER');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "carrier" "ShippingCarrier",
ADD COLUMN     "carrierCompanyName" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- CreateIndex
CREATE INDEX "orders_carrier_idx" ON "orders"("carrier");
