/**
 * create-proxy-route.ts — Factory function cho Next.js API route handlers.
 *
 * Mỗi resource chỉ cần 1 dòng:
 *   export const { GET, POST, ... } = createProxyRoute('products', { enableRefresh: true })
 *
 * Thay thế pattern cũ: 3-7 lines handler × mỗi resource file.
 * Factory này chỉ dùng cho server-side (app/api/.../route.ts).
 *
 * Shared HTTP logic: proxy-request.ts
 */
import { type NextRequest } from 'next/server'
import { proxyRequest } from './proxy-request'

/** Standard Next.js route handler context (App Router) */
type RouteContext = { params: Promise<{ path?: string[] }> }

/** Supported HTTP methods */
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

const ALL_METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

interface CreateOptions {
  /** Enable auto-refresh on 401 — default: true */
  enableRefresh?: boolean
  /** Limit methods (default: GET+POST+PUT+PATCH+DELETE) */
  methods?: Method[]
}

/**
 * Tạo route handler cho 1 resource prefix.
 *
 * @param prefix  API prefix (e.g., 'products' → forwards to /api/products)
 * @param opts    { enableRefresh, methods }
 * @returns Record<Method, handler> để export trực tiếp
 *
 * @example
 * ```ts
 * // app/api/products/[[...path]]/route.ts
 * export const { GET, POST, PUT, PATCH, DELETE } = createProxyRoute('products')
 * ```
 */
export function createProxyRoute(prefix: string, opts: CreateOptions = {}) {
  const methods = opts.methods ?? ALL_METHODS
  const enableRefresh = opts.enableRefresh ?? true

  const handler = async (request: NextRequest, ctx: RouteContext) => {
    const { path } = await ctx.params
    const apiPath = path?.length ? `${prefix}/${path.join('/')}` : prefix
    return proxyRequest(request, apiPath, { enableRefresh })
  }

  return Object.fromEntries(
    methods.map(m => [m, handler]),
  ) as Record<Method, typeof handler>
}
