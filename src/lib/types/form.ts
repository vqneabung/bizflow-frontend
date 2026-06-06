/**
 * form.ts — Generic form-related types.
 *
 * Cung cấp base types cho form components, giúp tách logic UI khỏi validation.
 */

import type { FieldValues } from 'react-hook-form'

/**
 * Base props cho form components.
 * T tách ra để các form khác (OrderForm, CustomerForm, ...) đều dùng chung.
 */
export interface BaseFormProps<TFieldValues extends FieldValues> {
  /** 'create' = submit tạo mới; 'edit' = submit update */
  mode: 'create' | 'edit'
  /** Initial values cho react-hook-form */
  defaultValues?: Partial<TFieldValues>
  /** Submit handler — async, throw error để hiển thị serverError */
  onSubmit: (data: TFieldValues) => Promise<void> | void
  /** Disable inputs khi đang submit */
  isSubmitting: boolean
  /** Server-side error message (hiển thị trên đầu form) */
  serverError?: string | null
}
