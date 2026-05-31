/**
 * TopLoader.tsx — Progress bar hiển thị khi chuyển trang.
 *
 * Dùng @bprogress/next thay vì nprogress vì:
 * - TypeScript native, active maintenance (nprogress 5 năm không update)
 * - Tích hợp sẵn với Next.js App Router (auto detect navigation)
 * - Không cần CSS import riêng
 *
 * Màu sắc match theme Bizflow (#7c3aed = brand-600).
 */
'use client'

import { Progress } from '@bprogress/next'

export default function TopLoader() {
  return (
    <Progress
      color="#7c3aed"
    />
  )
}
