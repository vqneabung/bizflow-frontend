/**
 * image-upload.tsx — Multi-file image upload component.
 *
 * Features:
 * - Drag & drop (HTML5 API) + click to browse
 * - Max 5 files (giới hạn từ backend ProductEntity.MAX_IMAGES)
 * - Preview local (blob URL) trước khi upload
 * - Upload lên MinIO qua storageApi.upload() với prefix "products"
 * - Hiển thị existing images (edit mode) — resolve qua useImageUrl
 * - Loading state cho từng file (progress feedback)
 * - Xóa từng ảnh (local + existing)
 * - Validation: file type (jpg/png/webp), size (<10MB)
 *
 * API: Expose `uploadAll` qua forwardRef + useImperativeHandle.
 * Parent (ProductForm) gọi ref.current?.uploadAll() trên form submit.
 */
'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { storageApi } from '@/lib/api/storage'
import { useImageUrl } from '@/lib/hooks/use-image-url'
import { cn } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ── Types ────────────────────────────────────────────────────

interface PendingFile {
  localId: string
  file: File
  previewUrl: string
  status: 'pending' | 'uploading' | 'uploaded' | 'error'
  objectKey?: string
  error?: string
}

export interface ImageUploadProps {
  existingImageKeys: string[]
  onImageKeysChange: (keys: string[]) => void
  disabled?: boolean
  error?: string
  prefix?: string
}

export interface ImageUploadHandle {
  uploadAll: () => Promise<string[]>
}

// ── Component ────────────────────────────────────────────────

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(function ImageUpload(
  {
    existingImageKeys,
    onImageKeysChange,
    disabled = false,
    error,
    prefix = 'products',
  },
  ref,
) {
  // ── State ──────────────────────────────────────────────────
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCount = existingImageKeys.length + pendingFiles.length
  const canAddMore = totalCount < MAX_FILES

  useEffect(() => {
    return () => {
      for (const pf of pendingFiles) {
        URL.revokeObjectURL(pf.previewUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers: file input ──────────────────────────────────
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const validFiles: PendingFile[] = []
      for (const file of Array.from(files)) {
        if (totalCount + validFiles.length >= MAX_FILES) break

        if (!ACCEPTED_TYPES.includes(file.type)) {
          validFiles.push({
            localId: crypto.randomUUID(),
            file,
            previewUrl: '',
            status: 'error',
            error: 'Định dạng không hỗ trợ',
          })
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          validFiles.push({
            localId: crypto.randomUUID(),
            file,
            previewUrl: '',
            status: 'error',
            error: 'Ảnh quá lớn (>10MB)',
          })
          continue
        }

        validFiles.push({
          localId: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: 'pending',
        })
      }

      setPendingFiles((prev) => [...prev, ...validFiles])
    },
    [totalCount],
  )

  // ── Handlers: drag & drop ─────────────────────────────────
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  const handleClick = () => {
    if (!disabled && canAddMore) inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  // ── Handlers: remove ──────────────────────────────────────
  const handleRemovePending = (localId: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((p) => p.localId === localId)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.localId !== localId)
    })
  }

  const handleRemoveExisting = (objectKey: string) => {
    onImageKeysChange(existingImageKeys.filter((k) => k !== objectKey))
  }

  // ── Public API: upload all pending ────────────────────────
  const uploadAll = useCallback(async (): Promise<string[]> => {
    const toUpload = pendingFiles.filter(
      (p) => p.status === 'pending' || p.status === 'error',
    )
    if (toUpload.length === 0) return existingImageKeys

    setPendingFiles((prev) =>
      prev.map((p) =>
        p.status === 'pending' ? { ...p, status: 'uploading' as const } : p,
      ),
    )

    const results = await Promise.allSettled(
      toUpload.map(async (pf) => {
        const res = await storageApi.upload(pf.file, prefix)
        if (!res.success || !res.data) {
          throw new Error(res.message || 'Upload failed')
        }
        return { localId: pf.localId, objectKey: res.data.objectKey }
      }),
    )

    const newObjectKeys: string[] = []
    let hasError = false
    const uploadedMap = new Map<string, string>() // localId → objectKey

    for (const r of results) {
      if (r.status === 'fulfilled') {
        newObjectKeys.push(r.value.objectKey)
        uploadedMap.set(r.value.localId, r.value.objectKey)
      } else {
        hasError = true
      }
    }

    // Update UI state only (React batches async; do NOT compute return values here)
    setPendingFiles((prev) =>
      prev.map((p) => {
        const objectKey = uploadedMap.get(p.localId)
        if (objectKey) {
          return { ...p, status: 'uploaded' as const, objectKey }
        }
        return { ...p, status: 'error' as const, error: 'Upload failed' }
      }),
    )

    if (hasError) throw new Error('Some images failed to upload')

    const finalKeys = [...existingImageKeys, ...newObjectKeys]
    onImageKeysChange(finalKeys)
    return finalKeys
  }, [pendingFiles, existingImageKeys, prefix, onImageKeysChange])

  useImperativeHandle(ref, () => ({ uploadAll }), [uploadAll])

  // ── Render slots ──────────────────────────────────────────
  const existingSlots = existingImageKeys.map((objectKey) => (
    <ExistingImageSlot
      key={objectKey}
      objectKey={objectKey}
      onRemove={() => handleRemoveExisting(objectKey)}
      disabled={disabled}
    />
  ))

  const pendingSlots = pendingFiles.map((pf) => (
    <PendingImageSlot
      key={pf.localId}
      pending={pf}
      onRemove={() => handleRemovePending(pf.localId)}
      disabled={disabled}
    />
  ))

  const emptySlotCount = Math.max(0, MAX_FILES - totalCount)
  const emptySlots = Array.from({ length: emptySlotCount }, (_, i) => (
    <EmptySlot
      key={`empty-${i}`}
      disabled={disabled || !canAddMore}
      onClick={handleClick}
    />
  ))

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Hình ảnh sản phẩm <span className="text-muted-foreground text-xs">({totalCount}/{MAX_FILES})</span>
      </label>

      <div
        className={cn(
          'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 rounded-lg border-2 border-dashed transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-zinc-200',
          disabled && 'opacity-50 pointer-events-none',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {existingSlots}
        {pendingSlots}
        {emptySlots}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <p className="text-xs text-muted-foreground">
        Kéo thả ảnh vào đây hoặc click để chọn. Tối đa {MAX_FILES} ảnh, mỗi ảnh &lt; 10MB (JPG, PNG, WebP).
      </p>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
})

export default ImageUpload

// ── Sub-components ───────────────────────────────────────────

function ExistingImageSlot({
  objectKey,
  onRemove,
  disabled,
}: {
  objectKey: string
  onRemove: () => void
  disabled: boolean
}) {
  const { url, isLoading } = useImageUrl(objectKey)
  return (
    <div className="relative aspect-square rounded-md overflow-hidden border bg-zinc-50 group">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      ) : url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs">
          Lỗi
        </div>
      )}
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Xóa ảnh"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function PendingImageSlot({
  pending,
  onRemove,
  disabled,
}: {
  pending: PendingFile
  onRemove: () => void
  disabled: boolean
}) {
  return (
    <div className="relative aspect-square rounded-md overflow-hidden border bg-zinc-50 group">
      {pending.previewUrl && (
        <img src={pending.previewUrl} alt="" className="w-full h-full object-cover" />
      )}
      {pending.status === 'uploading' && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      {pending.status === 'error' && (
        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white text-xs p-1 text-center">
          {pending.error ?? 'Lỗi'}
        </div>
      )}
      {pending.status === 'uploaded' && (
        <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">
          ✓
        </div>
      )}
      {!disabled && pending.status !== 'uploading' && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Xóa ảnh"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function EmptySlot({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'aspect-square rounded-md border-2 border-dashed border-zinc-200',
        'flex flex-col items-center justify-center gap-1 text-zinc-400 text-xs',
        'hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors',
        disabled && 'opacity-50 cursor-not-allowed hover:border-zinc-200 hover:text-zinc-400 hover:bg-transparent',
      )}
    >
      {disabled ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <ImagePlus className="h-5 w-5" />
          <span>Thêm</span>
        </>
      )}
    </button>
  )
}
