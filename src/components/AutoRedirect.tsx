/**
 * AutoRedirect — Client component dùng cho full-page navigation.
 *
 * Thay thế cho server-side redirect() khi target là Route Handler
 * trả về redirect (cross-origin) — tránh lỗi "Failed to fetch RSC payload".
 *
 * window.location.href bypass Next.js client router hoàn toàn.
 */
'use client'

import { useEffect } from 'react'

export function AutoRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url
  }, [url])

  return null
}
