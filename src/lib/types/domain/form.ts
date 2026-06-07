import type { FieldValues } from 'react-hook-form'

export interface BaseFormProps<TFieldValues extends FieldValues> {
  mode: 'create' | 'edit'
  defaultValues?: Partial<TFieldValues>
  onSubmit: (data: TFieldValues) => Promise<void> | void
  isSubmitting: boolean
  serverError?: string | null
}
