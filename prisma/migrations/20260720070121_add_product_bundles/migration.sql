-- CreateTable
CREATE TABLE "product_bundles" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "bundledProductId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_bundles_productId_idx" ON "product_bundles"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_bundles_productId_bundledProductId_key" ON "product_bundles"("productId", "bundledProductId");

-- AddForeignKey
ALTER TABLE "product_bundles" ADD CONSTRAINT "product_bundles_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_bundles" ADD CONSTRAINT "product_bundles_bundledProductId_fkey" FOREIGN KEY ("bundledProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
