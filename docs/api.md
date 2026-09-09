# SmartServe API documentation

> The current implementation uses Next.js Server Actions. It does not expose the main application operations as conventional public REST endpoints under `app/api/*`.

## 1. Communication pattern

- The frontend calls Server Actions directly through Next.js.
- Prisma reads and updates data in PostgreSQL.
- Polling is the reliable update path. Supabase WebSocket updates are optional and only valid when Supabase owns the same PostgreSQL database.

## 2. Logical API operations

| Logical method | Logical URL | Purpose | Required access | Request | Response | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/actions/createOrder` | Create a guest order | None | `tableToken`, `idempotencyKey`, `items[]` | `{ orderId }` | validation/not found |
| GET | `/actions/getActiveOrders` | Read kitchen orders | `update_kitchen_status` | `statuses[]`, scoped restaurant | `ActiveKitchenOrder[]` | forbidden/validation |
| PATCH | `/actions/updateOrderStatus` | Update a kitchen item | `update_kitchen_status` | `orderItemId`, `status` | `void` | forbidden/validation/not found |

This table documents the logical contract. The actual transport layer is implemented with Server Actions.

## 3. Request and response contracts

### 3.1 `createOrder`

Request:

```json
{
  "tableToken": "opaque-qr-token-from-table",
  "idempotencyKey": "123e4567-e89b-42d3-a456-426614174000",
  "items": [
    { "menuItemId": 101, "quantity": 2, "course": 1 },
    { "menuItemId": 204, "quantity": 1, "course": 2 }
  ]
}
```

Response:

```json
{
  "orderId": 1234
}
```

Important frontend-to-backend fields:

- `tableToken` must exactly match the opaque `Table.qrSlug` value.
- Price and availability are resolved on the server; client-provided prices are not accepted.
- `idempotencyKey` prevents duplicate submissions for the same table.

### 3.2 `getActiveOrders`

Request:

```json
{
  "statuses": ["PENDING", "COOKING"]
}
```

Response:

```json
[
  {
    "id": 1234,
    "createdAt": "2026-04-15T10:15:00.000Z",
    "status": "PENDING",
    "items": [
      {
        "quantity": 2,
        "priceAtTime": 189,
        "menuItem": { "name": "Classic Burger" }
      }
    ]
  }
]
```

### 3.3 `updateOrderStatus`

Request:

```json
{
  "orderItemId": 1234,
  "status": "READY"
}
```

Response:

```json
{}
```

## 4. Error model

Recommended error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order data",
    "details": {}
  }
}
```
