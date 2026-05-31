/**
 * Login page — Redirect đến authorize endpoint (OIDC flow).
 *
 * Dùng redirect từ next/navigation (không phải i18n) vì:
 * /api/auth/authorize là API route, không phải page có locale.
 *
 * Server component: không set cookie ở đây, chỉ redirect.
 * Route Handler /api/auth/authorize sẽ tạo PKCE + set cookie.
 */
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  redirect('/api/auth/authorize')
}
