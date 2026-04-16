ALTER TABLE "Order"
ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "OrderItem"
ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE INDEX "Order_completedAt_idx" ON "Order"("completedAt");
CREATE INDEX "OrderItem_completedAt_idx" ON "OrderItem"("completedAt");
