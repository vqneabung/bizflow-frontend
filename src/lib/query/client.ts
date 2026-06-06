/**
 * client.ts — Singleton QueryClient cho TanStack Query.
 *
 * Pattern chuẩn cho Next.js App Router (theo TanStack docs):
 * - Server: tạo QueryClient mới mỗi request (tránh share state giữa users)
 * - Browser: tạo 1 instance duy nhất cho cả session
 *
 * Default options:
 * - staleTime: 60s — tránh refetch ngay khi component remount
 * - retry: 1 cho queries, 0 cho mutations (tránh duplicate POST)
 * - refetchOnWindowFocus: bật cho UX tốt khi user quay lại tab
 */
import {
  QueryClient,
  environmentManager,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    // Server: luôn tạo mới (mỗi request = 1 instance riêng)
    return makeQueryClient();
  }
  // Browser: tạo singleton, tránh recreate khi React suspend
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
