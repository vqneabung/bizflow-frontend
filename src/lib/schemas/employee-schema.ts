import { z } from 'zod'

export const createEmployeeFormSchema = z.object({
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  name: z.string().max(255).optional().or(z.literal('')),
  password: z.string().min(6, 'passwordMin'),
})

export const resetPasswordFormSchema = z.object({
  newPassword: z.string().min(6, 'passwordMin'),
})

export type CreateEmployeeFormData = z.infer<typeof createEmployeeFormSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>

export const CREATE_EMPLOYEE_DEFAULTS: CreateEmployeeFormData = {
  email: '',
  name: '',
  password: '',
}

export const RESET_PASSWORD_DEFAULTS: ResetPasswordFormData = {
  newPassword: '',
}