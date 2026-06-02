/**
 * Proxy API: /api/products/[...path] — Forward all product requests to Spring Boot.
 *
 * Flow:
 * 1. Client gửi request đến /api/products/... (có kèm cookie session_token)
 * 2. Route Handler đọc session_token từ cookie
 * 3. Forward request đến Spring Boot API với Bearer token
 * 4. Trả response về cho client
 *
 * Hỗ trợ: GET, POST, PUT, PATCH, DELETE
 */
import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

/**
 * Forward request đến Spring Boot.
 * Đọc session_token từ cookie → Authorization: Bearer header.
 */
async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pathname = path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE}/api/${pathname}${searchParams ? '?' + searchParams : ''}`

  // Đọc JWT từ httpOnly cookie
  const sessionToken = request.cookies.get('session_token')?.value

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') ?? 'application/json',
  }
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`
  }

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.json().catch(() => undefined)
    : undefined

  try {
    const springRes = await fetch(url, {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const json = await springRes.json().catch(() => null)
    return NextResponse.json(json, { status: springRes.status })
  } catch (error) {
    console.error(`Proxy error: ${request.method} ${url}`, error)
    return NextResponse.json(
      { success: false, message: 'Cannot connect to server' },
      { status: 502 }
    )
  }
}

export const GET = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
