# Frontend документація (SmartServe)

## 1. Огляд frontend-частини

Frontend SmartServe реалізований на **Next.js 15 (App Router)** з **React 19** та **Tailwind CSS v4**. UI орієнтований на планшет/мобільні сценарії ресторану:

- Гість: перегляд меню столика + оформлення замовлення.
- Кухня: realtime-борд активних замовлень.
- Офіціант: борд готових замовлень до подачі.
- Адмін: генератор QR, статистика, звіти.

## 2. Технологічний стек

- Framework: `next@15.5.24`
- UI: `react@19.1.0`, `react-dom@19.1.0`
- Styling: `tailwindcss@4`
- Client state: `zustand@5` (+ persist middleware)
- Language: TypeScript

## 3. Локальний запуск (frontend)

```bash
npm install
cp docs/env.frontend.example .env.local
npm run dev
```

Для production-збірки:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## 4. Структура frontend-модулів

- `src/app/page.tsx` — landing з навігацією.
- `src/app/table/[id]/page.tsx` — гостьова сторінка меню конкретного столика.
- `src/components/MenuItemCard.tsx` — картка страви + додавання в кошик.
- `src/components/CartFloatingButton.tsx` — кошик і оформлення замовлення.
- `src/store/useCartStore.ts` — persist-кошик (local storage).
- `src/components/KitchenRealtimeBoard.tsx` — борд кухні.
- `src/components/WaiterReadyBoard.tsx` — борд офіціанта.
- `src/components/AdminQrGenerator.tsx` — UI генерації QR-коду.

## 5. State management

Використовується `zustand`-store `useCartStore`:
- `tableId` та opaque `tableToken` — поточний столик і public order capability.
- `items` — товари в кошику.
- `totalPrice` — обчислена сума.

Дії:
- `setTableContext`, `addItem`, `removeItem`, `clearCart`.

Persist ключ: `smartserve-cart-store`.

## 6. Frontend ↔ Backend взаємодія

У цьому проєкті взаємодія організована через **Next.js Server Actions** (без окремого REST-контролера в репозиторії):

- `createOrder` — створення замовлення.
- `getActiveOrders` — отримання активних замовлень.
- `updateOrderStatus` — зміна статусу.

### Realtime

Борди кухні/офіціанта оновлюються двома механізмами:
1. Polling (інтервал, за замовчуванням 5 сек).
2. Опційна WebSocket підписка на Supabase Realtime, лише при `NEXT_PUBLIC_ENABLE_SUPABASE_REALTIME=true` і спільній PostgreSQL DB.

## 7. UI/UX та стилізація

- Основний стиль — utility-класи Tailwind.
- Валюта та UI-тексти винесені в `src/lib/ui-config.ts`.
- Тексти інтерфейсу переважно українською.

## 8. Error handling і loading стани

- На клієнті використано `try/catch` у асинхронних діях для показу fallback-повідомлень.
- Для бордів є проміжний loading-стан (`isLoading`).
- Для невалідного/відсутнього столика — окремі UX-екрани помилок.

## 9. [Потрібно уточнення]

- У репозиторії немає e2e/UI тестів (Playwright/Cypress).
- Не знайдено централізованої дизайн-системи (окремих tokens/theme файлів окрім локальних UI-констант).
