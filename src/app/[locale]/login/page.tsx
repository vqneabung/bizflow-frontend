/**
 * Login page — Logic chia 2 trường hợp:
 *
 * 1. Có query param `?logout=true` → User vừa logout.
 *    KHÔNG auto-redirect OIDC (vì JSESSIONID ở Spring Boot vừa bị hủy,
 *    nhưng nếu auto-redirect có thể nhận OIDC flow mới do referer/etc).
 *    Hiển thị thông báo "đã đăng xuất" + nút "Đăng nhập lại".
 *
 * 2. Có query param `?error=xxx` → OIDC flow thất bại ở bước nào đó
 *    (auth_failed, no_code, no_verifier, token_exchange, no_token, unknown).
 *    Hiển thị thông báo lỗi + nút "Thử lại" (cũng trigger OIDC).
 *
 * 3. Không có query param → Auto-redirect OIDC (UX cũ, vẫn giữ).
 */
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ logout?: string; error?: string; redirect?: string }>
}

// Map error code từ callback/oidc/route.ts sang message key
const ERROR_KEYS: Record<string, string> = {
  auth_failed: 'errorAuthFailed',
  no_code: 'errorNoCode',
  no_verifier: 'errorNoVerifier',
  token_exchange: 'errorTokenExchange',
  no_token: 'errorNoToken',
  unknown: 'errorUnknown',
}

export default async function LoginPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const sp = await searchParams

  // Trường hợp 1: vừa logout
  if (sp.logout === 'true') {
    const t = await getTranslations({ locale, namespace: 'auth.login' })
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            {t('loggedOutTitle')}
          </h1>
          <p className="text-zinc-600 mb-6">{t('loggedOutMessage')}</p>
          <a
            href={`/api/auth/authorize?locale=${locale}`}
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
          >
            {t('loginAgain')}
          </a>
        </div>
      </div>
    )
  }

  // Trường hợp 2: lỗi OIDC
  if (sp.error) {
    const t = await getTranslations({ locale, namespace: 'auth.login' })
    const messageKey = ERROR_KEYS[sp.error] ?? 'errorUnknown'
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            {t('errorTitle')}
          </h1>
          <p className="text-zinc-600 mb-6">{t(messageKey)}</p>
          <a
            href={`/api/auth/authorize?locale=${locale}`}
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
          >
            {t('loginAgain')}
          </a>
        </div>
      </div>
    )
  }

  // Trường hợp 3: auto-redirect OIDC (mặc định, UX cũ)
  // Pass locale qua query param để /authorize encode vào state
  const redirectUrl = sp.redirect
    ? `/api/auth/authorize?locale=${locale}&redirect=${encodeURIComponent(sp.redirect)}`
    : `/api/auth/authorize?locale=${locale}`
  redirect(redirectUrl)
}
