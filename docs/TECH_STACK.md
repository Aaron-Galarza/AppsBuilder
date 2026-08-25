# Tech Stack

## AppsBuilder (Monorepo)

### Builder UI
- **Framework:** Next.js 15 (Pages Router)
- **UI:** React 18, Tailwind CSS 4
- **State:** Zustand
- **Forms:** React Hook Form, Zod
- **Generador:** JSZip, Sharp, Cloudinary SDK
- **Puerto:** 3001

### Backend (AppsBuilder)
- **Runtime:** Node.js
- **Framework:** Express
- **Base de datos:** MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken)
- **Tiempo real:** Socket.io
- **Upload:** Multer
- **Puerto:** 3000

### Web Admin (AppsBuilder)
- **Framework:** Next.js 15 (App Router)
- **UI:** React 18, Tailwind CSS 4
- **State:** Zustand (persist)
- **Puerto:** 3002

### Paquetes Compartidos (`packages/`)
- **ui:** Componentes React base (Button, Card, Input, etc.)
- **blocks:** Bloques de secciones (hero, menu, about, cta, etc.)
- **hooks:** Hooks compartidos (useMenu, useCart, useAuth, etc.)
- **types:** Tipos TypeScript compartidos
- **utils:** Utilidades (cn, formatPrice, isValidHex, etc.)
- **configs:** Configuración del proyecto cliente (ProjectConfig)

---

## Proyectos Generados (ZIP)

### webOrders

#### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Base de datos:** MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken, bcryptjs)
- **Tiempo real:** Socket.io
- **Upload:** Multer + Cloudinary
- **Deploy:** Render

#### Web (Next.js)
- **Framework:** Next.js 15 (App Router)
- **UI:** React 18, Tailwind CSS 4
- **State:** Zustand
- **HTTP:** fetch API
- **Deploy:** Vercel

#### Web Admin
- **Framework:** Next.js 15 (App Router)
- **UI:** React 18, Tailwind CSS 4
- **State:** Zustand (persist)
- **Deploy:** Vercel

### landingPages

#### Web (Next.js)
- **Framework:** Next.js 15 (App Router)
- **UI:** React 18, Tailwind CSS 4
- **State:** Zustand
- **Deploy:** Vercel

---

## Herramientas de Desarrollo

- **Package Manager:** pnpm (monorepo workspaces)
- **Build:** Turborepo
- **Linting:** ESLint
- **Types:** TypeScript 5
- **Git:** Conventional Commits
