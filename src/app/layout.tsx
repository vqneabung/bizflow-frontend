/**
 * Root layout — Minimal, không locale.
 *
 * next-intl yêu cầu root layout chỉ là wrapper.
 * Tất cả cấu hình (font, metadata, ...) nằm ở app/[locale]/layout.tsx
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
