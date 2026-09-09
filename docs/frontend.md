# SmartServe frontend documentation

## 1. Overview

The SmartServe frontend uses **Next.js 15 App Router**, **React 19**, and **Tailwind CSS 4**. The interface is designed around restaurant tablet and mobile workflows:

- Guest: browse a table menu and place an order.
- Kitchen: monitor and update active orders.
- Waiter: track ready items, serving, and bills.
- Administrator: manage restaurants, QR codes, menus, tables, and statistics.

## 2. Technology

- Framework: `next@15.5.24`
- UI: `react@19.1.0`, `react-dom@19.1.0`
- Styling: `tailwindcss@4`
- Client state: `zustand@5` with persistence middleware
- Language: TypeScript

## 3. Local frontend setup

```bash
npm install
cp docs/env.frontend.example .env.local
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## 4. Frontend modules

- `src/app/page.tsx` — landing page and navigation.
- `src/app/[restaurantSlug]/table/[id]/page.tsx` — guest menu for a specific table.
- `src/components/MenuItemCard.tsx` — menu item card and cart action.
- `src/components/CartFloatingButton.tsx` — cart and order submission.
- `src/store/useCartStore.ts` — persistent cart state in local storage.
- `src/components/KitchenRealtimeBoard.tsx` — kitchen board.
- `src/components/WaiterReadyBoard.tsx` — waiter board.
- `src/components/AdminQrGenerator.tsx` — table QR code interface.

## 5. State management

The `useCartStore` Zustand store contains:

- `tableId` and opaque `tableToken` — the current table and its public order capability.
- `items` — cart items.
- `totalPrice` — calculated total.

Actions include `setTableContext`, `addItem`, `removeItem`, and `clearCart`.

Persistence key: `smartserve-cart-store`.

## 6. Frontend and backend communication

SmartServe uses **Next.js Server Actions** rather than a separate REST controller:

- `createOrder` creates an order.
- `getActiveOrders` retrieves active orders.
- `updateOrderStatus` changes an item or order status.

### Realtime updates

The kitchen and waiter boards use two update mechanisms:

1. Polling, with a default interval of five seconds.
2. Optional Supabase Realtime WebSocket updates when `NEXT_PUBLIC_ENABLE_SUPABASE_REALTIME=true` and Supabase owns the same PostgreSQL database.

## 7. UI and styling

- Components use Tailwind utility classes.
- Shared currency and UI messages live in `src/lib/ui-config.ts`.
- User-facing interface text is in English.

## 8. Error and loading states

- Async client actions use `try/catch` and display fallback messages.
- Operational boards provide intermediate loading states.
- Invalid and missing tables have dedicated error screens.

## 9. Current limitations

- The repository does not yet contain browser E2E tests with Playwright or Cypress.
- There is no centralized design system beyond local constants and Tailwind classes.
