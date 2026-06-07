# AGENTS.md — bizflow-frontend (Next.js 16)

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cấu trúc dự án

```
bizflow-frontend/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── [locale]/              # i18n routing (vi/en)
│   │   │   ├── (public)/          # Public pages (login, register, about)
│   │   │   ├── dashboard/         # Authenticated user pages
│   │   │   │   ├── products/      # CRUD sản phẩm
│   │   │   │   └── profile/       # User profile
│   │   │   └── layout.tsx         # Locale layout
│   │   └── api/                   # BFF route handlers (Next.js → Spring)
│   │       ├── auth/              # /api/auth/* (login, register, me, logout)
│   │       ├── products/          # /api/products/* (proxy)
│   │       ├── reference/         # /api/reference/* (proxy)
│   │       └── storage/           # /api/storage/* (proxy + upload)
│   ├── components/                # Reusable React components
│   │   ├── ui/                    # shadcn primitives (button, card, input...)
│   │   ├── products/              # Feature-scoped (ProductForm, ProductTable...)
│   │   ├── Header.tsx             # App shell
│   │   └── UserInfoCard.tsx
│   ├── hooks/                     # Custom React hooks
│   │   └── use-current-user.ts    # Server hook (direct call to Spring)
│   ├── lib/
│   │   ├── api/                   # HTTP client layer
│   │   │   ├── client.ts          # Ky (browser) + prefixUrl
│   │   │   ├── server.ts          # Got (server) instances: springApi, oauthApi
│   │   │   ├── create-proxy-route.ts  # Route handler factory
│   │   │   ├── proxy-request.ts   # Shared proxy logic (with refresh)
│   │   │   ├── auth.ts            # /api/auth/* functions
│   │   │   ├── products.ts        # /api/products/* functions
│   │   │   ├── reference.ts       # /api/reference/* functions
│   │   │   └── storage.ts         # /api/storage/* functions
│   │   ├── query/                 # TanStack Query hooks
│   │   │   ├── client.ts          # QueryClient config
│   │   │   ├── provider.tsx       # <QueryClientProvider> wrapper
│   │   │   ├── products.ts        # useProductsQuery, useCreateProductMutation...
│   │   │   └── reference.ts       # useUnitsQuery, useCategoriesQuery...
│   │   ├── types/                 # Consolidated types (barrel index.ts)
│   │   │   ├── api/               #   common, user, product, reference
│   │   │   ├── domain/            #   error, form
│   │   │   └── index.ts           #   barrel re-export
│   │   ├── schemas/               # Zod validation
│   │   │   └── product-schema.ts
│   │   ├── mappers/               # FormData ↔ DTO
│   │   ├── cache/                 # In-memory cache (image cache)
│   │   ├── hooks/                 # use-image-url, use-product-filters
│   │   ├── oauth.ts               # OAuth/server constants
│   │   └── constants.ts
│   ├── i18n/                      # next-intl config + messages
│   │   ├── request.ts
│   │   ├── navigation.ts
│   │   └── routing.ts
│   └── proxy.ts                   # Next.js proxy config
├── messages/                      # i18n messages (vi, en)
├── public/                        # Static assets
├── package.json                   # pnpm (NOT npm)
└── AGENTS.md                      # This file
```

## Layer rules

| Layer | Path | Rule |
|---|---|---|
| **Presentation** | `app/[locale]/.../page.tsx`, `components/**` | Only JSX + handlers, NO business logic, NO direct fetch. |
| **Form** | `lib/schemas/`, `lib/types/domain/form.ts` | Zod schemas, form state types. |
| **Data** | `lib/api/**` | HTTP call functions (call `/api/...`). |
| **State** | `lib/query/**` | TanStack Query hooks (useXxxQuery, useXxxMutation). |
| **Server** | `app/api/**/route.ts` | BFF proxy to Spring Boot. |
| **Types** | `lib/types/**` | Shared TypeScript types/interfaces. |

## TypeScript rules

1. **No `any`** — dùng `unknown` + type guards. Khi buộc phải cast (RHF + union types, third-party types), dùng `as <concrete-type>` thay vì `as any`.
2. **No `@ts-ignore`** — dùng `@ts-expect-error` với reason hoặc refactor.
3. **Strict mode** — `"strict": true` trong `tsconfig.json`. KHÔNG dùng `// @ts-nocheck`.
4. **Discriminated unions** cho state machines (`type: 'create' | 'edit'` thay vì boolean `isEdit`).
5. **Generics** cho reusable hooks/components.
6. **Import type** — `import type { X } from '...'` cho type-only imports.

## Data fetching rules

1. **Browser → Next.js API**: dùng `ky` (client.ts) với `prefixUrl: '/api'`.
2. **Server component → Spring Boot**: dùng `springApi` (server.ts) trực tiếp với Bearer token. **KHÔNG** self-fetch qua Next.js route.
3. **Route handler → Spring Boot**: dùng `proxyRequest()` từ `lib/api/proxy-request.ts`. Tự động handle refresh token.
4. **All server-side data**: TanStack Query (`isPending` flag) — KHÔNG dùng `useState(loading)` + `useEffect`.
5. **Lỗi `setState in effect` (react-hooks/set-state-in-effect)** — đã migrate TanStack Query, còn 2 pre-existing ở `ProductSearchBar.tsx:60`, `ProductTable.tsx:87` (chấp nhận, có TODO).
6. **Cache invalidation**: Sau mutation, dùng `queryClient.invalidateQueries({ queryKey: ['xxx'] })` thay vì manual refetch.

## Component rules

1. **Default = Server Component**, chỉ thêm `'use client'` khi cần interactivity (state, effect, browser APIs).
2. **Props**: ưu tiên **discriminated union** thay vì boolean flags.
3. **Reuse trước khi tạo mới**: check `components/ui/` (shadcn) và `components/<feature>/` trước.
4. **Type-safe forms**: react-hook-form + zod. Tất cả fields trong form phải có zod schema.

## i18n rules

1. Mọi user-facing string phải qua `useTranslations()` (KHÔNG hard-code tiếng Việt/Anh trong JSX).
2. File messages: `messages/{vi,en}/<namespace>.json`.
3. Key naming: camelCase, descriptive (`products.errors.nameRequired`).

## Quy ước code

- **Package manager**: `pnpm` (KHÔNG dùng npm — đã xảy ra lỗi arborist tree).
- **Styling**: Tailwind CSS v4 + shadcn/ui. Tránh inline style.
- **Path alias**: `@/*` → `src/*`. LUÔN dùng alias thay vì relative paths.
- **Naming**: file = `kebab-case.tsx`, component = `PascalCase`, hook = `useXxx.ts`.

## Future folder predictions

Sẽ xuất hiện khi scale lên (khi nào có nhu cầu thật):

```
src/
├── app/api/
│   ├── orders/         # /api/orders/* — khi có orders module
│   ├── customers/      # /api/customers/* — khi có customers module
│   └── reports/        # /api/reports/* — khi có reports module
├── lib/
│   ├── workflow/       # Multi-step form wizards
│   ├── analytics/      # Tracking, events
│   └── realtime/       # WebSocket / SSE handlers
├── components/
│   ├── orders/         # Orders feature components
│   ├── customers/      # Customers feature components
│   └── reports/        # Reports feature components
└── middleware/         # Next.js middleware (auth gate, rate limit)
```

## Verification

Sau khi sửa code:
```bash
pnpm tsc --noEmit      # Type check
pnpm lint              # ESLint (đã giảm từ 21 → 2 problems)
pnpm build             # Production build
```

## Anti-patterns cần tránh

- ❌ `any` thay vì proper types
- ❌ `useEffect` để fetch data (dùng TanStack Query)
- ❌ `useState(loading)` + `setLoading` (dùng `isPending` từ TanStack Query)
- ❌ Self-fetch trong server component (gọi `fetch('http://localhost:3000/...')` từ server component → chậm, vòng lặp thừa)
- ❌ Hard-code tiếng Việt/Anh trong JSX
- ❌ `console.log` debugging trong code production
- ❌ Comment "what" (code đã tự giải thích) — chỉ comment "why"
