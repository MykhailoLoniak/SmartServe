ALTER TABLE "Order" ADD COLUMN "clientRequestId" TEXT;

CREATE UNIQUE INDEX "Order_tableId_clientRequestId_key"
ON "Order"("tableId", "clientRequestId");

-- Replace legacy predictable QR slugs without requiring a database extension.
UPDATE "Table"
SET "qrSlug" = md5(random()::text || clock_timestamp()::text || "id"::text);
