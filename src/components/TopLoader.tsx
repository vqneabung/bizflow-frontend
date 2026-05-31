/**
 * TopLoader.tsx — Progress bar hiển thị khi chuyển trang.
 *
 * Dùng ProgressProvider từ @bprogress/next/app (App Router) thay vì
 * Progress từ @bprogress/next (generic) vì:
 * - Auto detect route changes trong App Router
 * - Hỗ trợ props: color, height, options, shallowRouting
 * - Cần wrap children để tracking navigation context
 *
 * Màu sắc match theme Bizflow (#7c3aed = brand-600).
 * Chiều cao 4px, không spinner (giữ tối giản).
 * shallowRouting: bắt cả các navigation không làm thay đổi URL (search params).
 */
'use client'

import { ProgressProvider } from '@bprogress/next/app'

export default function TopLoader({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      color="#7c3aed"
      height="4px"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  )
}
