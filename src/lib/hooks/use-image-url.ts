/**
 * use-image-url.ts — React hook resolve MinIO objectKey → presigned URL.
 *
 * Tại sao cần:
 * - MinIO presigned URL có TTL (~1 giờ), không thể lưu DB
 * - Mỗi lần render product, cần URL mới (nếu cũ hết hạn)
 * - Dexie cache (`lib/cache/image-cache.ts`) tránh gọi API mỗi lần render
 *
 * Flow:
 * 1. Check Dexie cache theo objectKey
 * 2. Cache hit & còn hạn → return cached URL (sync)
 * 3. Cache miss hoặc hết hạn → fetch qua storageApi.getDownloadUrl
 * 4. Cache kết quả → return URL
 * 5. Cleanup on unmount: tránh setState sau khi component unmount
 *
 * Lint-safe: KHÔNG setState synchronous trong effect body. Dùng pattern
 * conditional check trước khi setState.
 *
 * Usage:
 *   const { url, isLoading } = useImageUrl(product.imageKeys[0])
 *   if (isLoading) return <Skeleton />
 *   return <img src={url ?? '/fallback.png'} />
 */
'use client'

import { useEffect, useReducer } from 'react'
import { getImageUrl } from '@/lib/cache/image-cache'

export interface UseImageUrlResult {
  /** Presigned URL — null nếu chưa load xong hoặc lỗi */
  url: string | null
  /** True khi đang fetch từ API (cache miss) */
  isLoading: boolean
  /** Error message nếu fetch thất bại */
  error: string | null
}

const INITIAL_RESULT: UseImageUrlResult = {
  url: null,
  isLoading: false,
  error: null,
}

type Action =
  | { type: 'reset' }
  | { type: 'loading' }
  | { type: 'success'; url: string }
  | { type: 'error'; error: string }

function reducer(_state: UseImageUrlResult, action: Action): UseImageUrlResult {
  switch (action.type) {
    case 'reset':
      return INITIAL_RESULT
    case 'loading':
      return { url: null, isLoading: true, error: null }
    case 'success':
      return { url: action.url, isLoading: false, error: null }
    case 'error':
      return { url: null, isLoading: false, error: action.error }
  }
}

/**
 * Resolve một MinIO objectKey sang presigned URL.
 *
 * @param objectKey MinIO object key (VD: "products/uuid.jpg") — null/undefined = no image
 * @returns { url, isLoading, error }
 */
export function useImageUrl(objectKey: string | null | undefined): UseImageUrlResult {
  const [result, dispatch] = useReducer(reducer, INITIAL_RESULT)

  useEffect(() => {
    // No key → reset to empty (no async work needed)
    if (!objectKey) {
      dispatch({ type: 'reset' })
      return
    }

    // Mark loading ngay khi effect chạy (async dispatch after fetch)
    dispatch({ type: 'loading' })

    let cancelled = false
    getImageUrl(objectKey)
      .then((url) => {
        if (!cancelled) dispatch({ type: 'success', url })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          dispatch({
            type: 'error',
            error: err instanceof Error ? err.message : 'Failed to load image',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [objectKey])

  return result
}

// ── Batch version ────────────────────────────────────────────

interface BatchState {
  urls: Map<string, string>
  isLoading: boolean
  errors: Map<string, string>
}

const INITIAL_BATCH: BatchState = {
  urls: new Map(),
  isLoading: false,
  errors: new Map(),
}

type BatchAction =
  | { type: 'reset' }
  | { type: 'loading' }
  | { type: 'success'; urls: Map<string, string>; errors: Map<string, string> }

function batchReducer(state: BatchState, action: BatchAction): BatchState {
  switch (action.type) {
    case 'reset':
      return INITIAL_BATCH
    case 'loading':
      return { ...state, isLoading: true }
    case 'success':
      return { urls: action.urls, errors: action.errors, isLoading: false }
  }
}

/**
 * Resolve nhiều objectKeys cùng lúc (batch) — dùng cho ProductTable list.
 *
 * Tối ưu so với gọi useImageUrl() N lần:
 * - 1 useEffect thay vì N
 * - 1 lần setState khi tất cả xong
 *
 * @param objectKeys Danh sách objectKey cần resolve
 * @returns { urls, isLoading, errors } — urls là Map<key, url>
 */
export function useImageUrls(objectKeys: ReadonlyArray<string>): {
  urls: Map<string, string>
  isLoading: boolean
  errors: Map<string, string>
} {
  const [state, dispatch] = useReducer(batchReducer, INITIAL_BATCH)

  // Key dùng để trigger effect khi array thay đổi
  const key = objectKeys.join('|')

  useEffect(() => {
    if (objectKeys.length === 0) {
      dispatch({ type: 'reset' })
      return
    }

    dispatch({ type: 'loading' })

    let cancelled = false
    Promise.allSettled(
      objectKeys.map(async (objectKey) => {
        const url = await getImageUrl(objectKey)
        return { objectKey, url }
      }),
    ).then((results) => {
      if (cancelled) return

      const newUrls = new Map<string, string>()
      const newErrors = new Map<string, string>()

      for (let i = 0; i < results.length; i += 1) {
        const r = results[i]
        const objectKey = objectKeys[i]
        if (!objectKey) continue
        if (r.status === 'fulfilled') {
          newUrls.set(objectKey, r.value.url)
        } else {
          newErrors.set(
            objectKey,
            r.reason instanceof Error ? r.reason.message : 'Failed to load',
          )
        }
      }

      dispatch({ type: 'success', urls: newUrls, errors: newErrors })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
