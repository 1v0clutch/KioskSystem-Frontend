# Frontend-New (React + TypeScript + Vite)

Refactored frontend for the Plasticware Kiosk System.

## Features
- **Modular Components**: Clean separation into `components/kiosk/` (`ShopView`, `CartView`, `OrdersView`, `KioskNavbar`) and `components/admin/` (`AdminSidebar`, `DashboardOverview`, `ProductsManager`, `CategoriesManager`, `OrdersManager`, `ReportsOverview`).
- **Unified API Client**: `src/api/client.ts` with automatic `Authorization: Bearer <token>` header injection.
- **Global Auth Provider**: React Auth Context in `src/context/AuthContext.tsx`.
- **Styling**: Tailwind CSS & Lucide icons.

## Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```
