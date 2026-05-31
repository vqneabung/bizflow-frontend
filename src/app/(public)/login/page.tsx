/**
 * Login page — Redirect đến Route Handler để tạo PKCE + OIDC redirect.
 *
 * KHÔNG set cookie ở đây — chỉ là Server Component, không được phép.
 * Việc set cookie được chuyển cho Route Handler (/api/auth/authorize).
 *
 * Flow:
 * 1. GET /login → Server Component này chạy
 * 2. redirect → /api/auth/authorize (Route Handler)
 * 3. Route Handler tạo PKCE params + set code_verifier cookie + redirect Spring Boot
 *
 * Tham khảo: https://nextjs.org/docs/app/api-reference/functions/cookies
 */
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  redirect('/api/auth/authorize')
}
