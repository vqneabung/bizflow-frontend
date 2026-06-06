/**
 * image-cache.ts — Image cache layer với Dexie (IndexedDB).
 *
 * Lý do: Presigned URL từ MinIO có TTL (~1 giờ). Nếu mỗi lần render
 * component đều gọi API để lấy URL mới, sẽ gây:
 *   1. N+1 requests mỗi khi list product
 *   2. Flash trắng khi chờ URL mới
 *   3. Tốn bandwidth cho cùng 1 URL
 *
 * Giải pháp:
 *   - Lưu presigned URL trong IndexedDB với objectKey làm primary key
 *   - Cache TTL = 50 phút (dưới MinIO expiry 60 phút)
 *   - productUpdatedAt: khi product bị update → clear cache của product đó
 *   - getImageUrl(): check cache → nếu miss → gọi API → cache → return
 *
 * Flow invalidation:
 *   product.imageUrl thay đổi → gọi invalidateProductImages(productId)
 *   → xóa tất cả entries có objectKey bắt đầu bằng "products/{productId}/"
 */
import Dexie, { type Table } from 'dexie'
import { storageApi } from '@/lib/api/storage'

// ── Schema ──────────────────────────────────────────────────

interface CachedImage {
  objectKey: string
  presignedUrl: string
  cachedAt: number
  /** ISO date string — product updatedAt để so sánh */
  productUpdatedAt?: string
}

class ImageCacheDB extends Dexie {
  images!: Table<CachedImage, string>

  constructor() {
    super('BizflowImageCache')
    this.version(1).stores({
      images: '&objectKey',
    })
  }
}

const db = new ImageCacheDB()

// ── Config ──────────────────────────────────────────────────

/** Cache TTL = 50 phút (MinIO presigned URL mặc định 60 phút) */
const CACHE_TTL = 50 * 60 * 1000

// ── Public API ──────────────────────────────────────────────

/**
 * Lấy presigned URL cho object key.
 * Cache-aware: nếu cache còn hạn → return cached, nếu hết → fetch mới.
 */
export async function getImageUrl(
  objectKey: string,
  productUpdatedAt?: string,
): Promise<string> {
  // 1. Check cache
  const cached = await db.images.get(objectKey)
  if (cached) {
    const isExpired = Date.now() - cached.cachedAt > CACHE_TTL
    const isStale = productUpdatedAt != null && cached.productUpdatedAt !== productUpdatedAt

    if (!isExpired && !isStale) {
      return cached.presignedUrl
    }
  }

  // 2. Cache miss — fetch from API
  const url = await storageApi.getImageUrl(objectKey)

  // 3. Store in cache
  await db.images.put({
    objectKey,
    presignedUrl: url,
    cachedAt: Date.now(),
    productUpdatedAt,
  })

  return url
}

/**
 * Batch lấy presigned URLs cho nhiều object keys cùng lúc.
 * Mỗi key check cache trước, chỉ fetch những key chưa có hoặc hết hạn.
 */
export async function getImageUrls(
  entries: Array<{ objectKey: string; productUpdatedAt?: string }>,
): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  const toFetch: Array<{ objectKey: string; productUpdatedAt?: string }> = []

  for (const entry of entries) {
    const cached = await db.images.get(entry.objectKey)
    if (cached) {
      const isExpired = Date.now() - cached.cachedAt > CACHE_TTL
      const isStale = entry.productUpdatedAt != null && cached.productUpdatedAt !== entry.productUpdatedAt

      if (!isExpired && !isStale) {
        result.set(entry.objectKey, cached.presignedUrl)
        continue
      }
    }
    toFetch.push(entry)
  }

  // Fetch tất cả keys bị miss trong parallel
  const fetched = await Promise.allSettled(
    toFetch.map(async (entry) => {
      const url = await storageApi.getImageUrl(entry.objectKey)
      return { objectKey: entry.objectKey, url, productUpdatedAt: entry.productUpdatedAt }
    }),
  )

  for (const f of fetched) {
    if (f.status === 'fulfilled') {
      const { objectKey, url, productUpdatedAt } = f.value
      result.set(objectKey, url)
      await db.images.put({
        objectKey,
        presignedUrl: url,
        cachedAt: Date.now(),
        productUpdatedAt,
      })
    }
  }

  return result
}

/**
 * Xóa cache cho 1 object key cụ thể.
 * Dùng khi xóa file hoặc khi biết URL đã hết hạn.
 */
export async function invalidateImageCache(objectKey: string): Promise<void> {
  await db.images.delete(objectKey)
}

/**
 * Xóa cache cho tất cả ảnh của 1 product.
 * Dùng prefix "products/{productId}/" để match.
 */
export async function invalidateProductImages(productId: string): Promise<void> {
  const prefix = `products/${productId}/`
  await db.images
    .filter((img) => img.objectKey.startsWith(prefix))
    .delete()
}

/**
 * Xóa toàn bộ image cache (khi logout).
 */
export async function clearAllImageCache(): Promise<void> {
  await db.images.clear()
}
