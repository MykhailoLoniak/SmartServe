# API документація (SmartServe)

> У поточній реалізації публічні HTTP REST endpoint-и не виділені окремо в `app/api/*`; використано Next.js Server Actions.

## 1. API communication pattern

- Frontend викликає server actions напряму через Next.js механізм.
- Дані зчитуються/оновлюються через Prisma у PostgreSQL.
- Realtime оновлення стану бордів виконується через Supabase WebSocket + polling fallback.

## 2. Операції (logical API table)

| Method (logical) | URL (logical) | Призначення | Auth required | Request body | Response body | Коди помилок |
|---|---|---|---|---|---|---|
| POST | `/actions/createOrder` | Створити замовлення | Ні (у коді) | `tableId`, `items[]` | `{ orderId }` | `400` (валідація), `404` (table not found), `500` |
| GET | `/actions/getActiveOrders` | Отримати замовлення у статусах | Ні (у коді) | `statuses[]` | `ActiveKitchenOrder[]` | `400`, `500` |
| PATCH | `/actions/updateOrderStatus` | Оновити статус замовлення | Ні (у коді) | `orderId`, `status` | `void` | `400`, `404`, `500` |

> Таблиця показує **логічний API-контракт** для документації. Фактичний transport шар — server actions.

## 3. Контракти запитів/відповідей

### 3.1 createOrder

#### Request

```json
{
  "tableId": 1,
  "items": [
    { "id": 101, "quantity": 2, "priceAtTime": 189.0 },
    { "id": 204, "quantity": 1, "priceAtTime": 95.0 }
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
- `tableId` має бути валідним існуючим столиком.
- `items[].id` має відповідати `menuItemId`.
- `items[].priceAtTime` фіксує ціну на момент замовлення.

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
  "orderId": 1234,
  "status": "READY"
}
```

#### Response

```json
{}
```

## 4. curl-приклади (референс для майбутнього REST-шару)

> [Потрібно уточнення] Нижче наведені приклади для потенційного REST API (якщо буде винесено `app/api/*`).

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"tableId":1,"items":[{"id":101,"quantity":1,"priceAtTime":189}]}'
```

```bash
curl "http://localhost:3000/api/orders/active?statuses=PENDING,COOKING"
```

```bash
curl -X PATCH http://localhost:3000/api/orders/1234/status \
  -H "Content-Type: application/json" \
  -d '{"status":"READY"}'
```

## 5. Error model (recommended)

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
