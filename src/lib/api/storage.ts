/**
 * storage.ts — Typed API client cho MinIO storage operations.
 *
 * Sử dụng Ky instance (src/lib/api/client.ts) với prefix '/api'.
 * Gọi qua Next.js API routes → Spring Boot → MinIO.
 *
 * Example:
 *   const { data } = await storageApi.upload(file)
 *   const imgUrl = await storageApi.getImageUrl(data.objectKey)
 */
import { api } from './client'
import type { ApiResponse } from '@/lib/types'

// ── Response types ──────────────────────────────────────────

export interface UploadResponse {
  objectKey: string
  url: string
  originalName: string
  contentType: string
  size: number
}

export interface PresignedUrlResponse {
  url: string
}

// ── Simple in-memory cache (tránh gọi presigned URL nhiều lần) ──

const urlCache = new Map<string, { url: string; expiresAt: number }>()

const FIVE_MINUTES = 5 * 60 * 1000

function getCachedUrl(key: string): string | null {
  const entry = urlCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    urlCache.delete(key)
    return null
  }
  return entry.url
}

function setCachedUrl(key: string, url: string): void {
  urlCache.set(key, { url, expiresAt: Date.now() + FIVE_MINUTES })
}

// ── API methods ─────────────────────────────────────────────

export const storageApi = {
  /**
   * Upload file lên MinIO (qua Spring Boot proxy).
   * @param file   File từ <input type="file">
   * @param prefix Thư mục prefix (VD: 'products', 'avatars')
   */
  upload: async (file: File, prefix?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (prefix) formData.append('prefix', prefix)

    return api
      .post('storage/upload', { body: formData })
      .json<ApiResponse<UploadResponse>>()
  },

  /**
   * Lấy presigned download URL (có cache trong memory 5 phút).
   * Dùng để hiển thị ảnh trong <img src> hoặc download file.
   */
  getDownloadUrl: async (key: string) => {
    const cached = getCachedUrl(key)
    if (cached) {
      return { success: true, message: 'Cached', data: { url: cached } } as ApiResponse<PresignedUrlResponse>
    }

    const res = await api
      .get(`storage/download-url?key=${encodeURIComponent(key)}`)
      .json<ApiResponse<PresignedUrlResponse>>()

    if (res.success && res.data?.url) {
      setCachedUrl(key, res.data.url)
    }
    return res
  },

  /**
   * Lấy presigned upload URL (cho phép browser upload trực tiếp lên MinIO).
   * Dùng cho file > 10MB để giảm tải cho proxy.
   */
  getUploadUrl: async (key: string, contentType?: string) => {
    const params = new URLSearchParams({ key })
    if (contentType) params.set('contentType', contentType)

    return api
      .get(`storage/upload-url?${params.toString()}`)
      .json<ApiResponse<PresignedUrlResponse>>()
  },

  /**
   * Xóa file khỏi MinIO.
   */
  delete: async (key: string) => {
    urlCache.delete(key) // Clear cache
    return api
      .delete(`storage/delete?key=${encodeURIComponent(key)}`)
      .json<ApiResponse<null>>()
  },

  /**
   * Kiểm tra file có tồn tại không.
   */
  exists: async (key: string) => {
    return api
      .get(`storage/exists?key=${encodeURIComponent(key)}`)
      .json<ApiResponse<boolean>>()
  },

  /**
   * Helper: Lấy image URL để gán vào <img src>.
   * Cache trong memory 5 phút, tự động refresh nếu hết hạn.
   */
  getImageUrl: async (objectKey: string): Promise<string> => {
    const cached = getCachedUrl(objectKey)
    if (cached) return cached

    const res = await storageApi.getDownloadUrl(objectKey)
    if (res.success && res.data?.url) {
      return res.data.url
    }
    throw new Error(`Failed to get image URL for ${objectKey}`)
  },
}
