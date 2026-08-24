# Placeholders

This document lists all the placeholders, TODOs, and missing implementations in the codebase.

## Backend (apps/backend/src/)

- [x] Move suelto folders (analytics, auth, categories, delivery, products) into modules/
- [x] Add missing modules: adicionales, coupons, gallery, geocoding, users, schedules
- [x] Move app.ts and server.ts into src/

## Blocks (packages/blocks/)

- [x] cart
- [x] checkout
- [x] admin
- [x] features
- [x] pricing
- [x] faq

## UI (packages/ui/)

- [x] layout/ : Header, Footer, PublicLayout, AdminLayout
- [x] admin/ : AdminCard, AdminInput, AdminActionButtons

## Hooks (packages/hooks/)

- [x] useCartStore
- [x] useAuthStore
- [x] useStoreStatus
- [x] useAddressSearch
- [x] useAdminCrud
- [x] useAdminOrders
- [x] useAdminMenu
- [x] useAdminConfig
- [x] useAdminOverview
- [x] useAdminCoupons
- [x] useAdminGallery
- [x] useQuickOrder

## Types (packages/types/)

- [x] category
- [x] addon
- [x] cart
- [x] coupon

## Landing Pages (apps/products/landingPages/)

- [x] templates/ _basic
- [x] templates/ _standard
- [x] templates/ _premium

## Builder UI (apps/builder-ui/)

- [x] stores/builderStore.ts
- [x] lib/generator/ with index.ts and generate.ts
- [x] lib/cloudinary.ts
- [x] lib/api.ts
- [x] lib/validators.ts
- [x] lib/constants.ts
- [x] pages/builder/[step].tsx (was [step] directory)

## Root

- [x] Remove package/ directory from root

## Documentation

- [x] Create docs/PLACEHOLDERS.md