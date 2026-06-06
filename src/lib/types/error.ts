/**
 * error.ts — Error type definitions and helpers.
 *
 * Mục đích: cung cấp type-safe error handling, thay thế `any` trong catch blocks.
 *
 * Design:
 * - AppError: extended Error với optional status/code/fieldErrors
 * - toAppError: convert unknown → AppError (an toàn khi catch từ bất kỳ nguồn nào)
 * - getErrorMessage: lấy message string từ unknown error (có fallback)
 *
 * Usage:
 *   try { ... } catch (err: unknown) { toast.error(getErrorMessage(err)) }
 *   try { ... } catch (err: unknown) { const e = toAppError(err); console.log(e.status) }
 */

/** Extended Error với metadata cho API errors */
export interface AppError extends Error {
  /** HTTP status code (nếu từ API) */
  status?: number
  /** Error code từ backend (e.g. "DUPLICATE_NAME") */
  code?: string
  /** Field-level validation errors: { fieldName: message } */
  fieldErrors?: Record<string, string>
}

/**
 * Convert bất kỳ `unknown` error thành AppError an toàn.
 * - Nếu đã là Error → cast thành AppError
 * - Nếu là string → wrap trong Error
 * - Nếu là object có message → wrap
 * - Nếu không xác định → Error mặc định
 */
export function toAppError(err: unknown): AppError {
  if (err instanceof Error) {
    return err as AppError
  }
  if (typeof err === 'string') {
    return new Error(err) as AppError
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = String((err as { message: unknown }).message)
    const e = new Error(message) as AppError
    if ('status' in err) e.status = Number((err as { status: unknown }).status)
    if ('code' in err) e.code = String((err as { code: unknown }).code)
    if ('fieldErrors' in err) {
      e.fieldErrors = (err as { fieldErrors: unknown }).fieldErrors as Record<string, string>
    }
    return e
  }
  return new Error('Unknown error') as AppError
}

/**
 * Lấy error message từ unknown, dùng cho toast/UI display.
 * @param err      unknown error từ catch block
 * @param fallback message mặc định nếu err không có message
 */
export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return fallback
}
