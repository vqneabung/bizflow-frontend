/**
 * Route: POST /api/storage/upload — Upload file lên MinIO qua Spring Boot.
 *
 * Không dùng proxyRequest() vì:
 * 1. proxyRequest parse body JSON → không hợp lệ với multipart/form-data
 * 2. File cần được forward dưới dạng FormData, không phải JSON
 *
 * Flow:
 * 1. Client gửi FormData (file + prefix) đến route này
 * 2. Route đọc session_token từ cookie
 * 3. Forward nguyên FormData đến Spring Boot API
 * 4. Trả kết quả về client
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE } from '@/lib/oauth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    // Đọc FormData từ request gốc
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const prefix = formData.get('prefix') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 },
      )
    }

    // Tạo FormData mới để forward (không thể reuse formData gốc)
    const backendForm = new FormData()
    backendForm.append('file', file, file.name)
    if (prefix) {
      backendForm.append('prefix', prefix)
    }

    const res = await fetch(`${API_BASE}/api/storage/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Không set Content-Type — fetch tự động set multipart boundary
      },
      body: backendForm,
    })

    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch (error) {
    console.error('[storage/upload]', error)
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 502 },
    )
  }
}

/** Không hỗ trợ GET trên route upload */
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 },
  )
}
