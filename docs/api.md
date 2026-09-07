# API документація (SmartServe)

> У поточній реалізації публічні HTTP REST endpoint-и не виділені окремо в `app/api/*`; використано Next.js Server Actions.

## 1. API communication pattern

- Frontend викликає server actions напряму через Next.js механізм.
- Дані зчитуються/оновлюються через Prisma у PostgreSQL.
- Polling є гарантованим update path; Supabase WebSocket — opt-in лише для тієї самої PostgreSQL DB.

## 2. Операції (logical API table)

| Method (logical) | URL (logical) | Призначення | Auth required | Request body | Response body | Коди помилок |
|---|---|---|---|---|---|---|
| POST | `/actions/createOrder` | Створити guest order | Ні | `tableToken`, `idempotencyKey`, `items[]` | `{ orderId }` | validation/not found |
| GET | `/actions/getActiveOrders` | Kitchen orders | `update_kitchen_status` | `statuses[]`, scoped restaurant | `ActiveKitchenOrder[]` | forbidden/validation |
| PATCH | `/actions/updateOrderStatus` | Kitchen item status | `update_kitchen_status` | `orderItemId`, `status` | `void` | forbidden/validation/not found |

> Таблиця показує **логічний API-контракт** для документації. Фактичний transport шар — server actions.

## 3. Контракти запитів/відповідей

### 3.1 createOrder

#### Request

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

#### Response

```json
{
  "orderId": 1234
}
```

Критичні поля фронт↔бек:
- `tableToken` повинен точно відповідати opaque `Table.qrSlug`.
- Ціна й доступність беруться server-side; client price не приймається.
- `idempotencyKey` запобігає дублюванню повторного submit для столика.

### 3.2 getActiveOrders

#### Request

```json
{
  "statuses": ["PENDING", "COOKING"]
}
```

#### Response

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
        "menuItem": { "name": "Класичний бургер" }
      }
    ]
  }
]
```

### 3.3 updateOrderStatus

#### Request

```json
{
  "orderItemId": 1234,
  "status": "READY"
}
```

#### Response

```json
{}
```

## 4. Error model

Рекомендований формат помилки:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некоректні дані замовлення",
    "details": {}
  }
}
```
