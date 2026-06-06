/**
 * provider.tsx — React Query Provider component.
 *
 * Wrap QueryClientProvider + Devtools (chỉ dev mode).
 * Đặt trong layout.tsx để có context cho toàn bộ app.
 */
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from './client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: KHÔNG dùng useState khi init QueryClient — React throw away client
  // nếu component suspend trong initial render.
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
