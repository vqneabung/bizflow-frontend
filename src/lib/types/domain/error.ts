export interface AppError extends Error {
  status?: number
  code?: string
  fieldErrors?: Record<string, string>
}

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

export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return fallback
}
