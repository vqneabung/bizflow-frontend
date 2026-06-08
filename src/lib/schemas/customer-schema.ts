/**
 * customer-schema.ts — Zod schemas cho Customer form validation.
 *
 * Layer: Form validation (UI → data shape).
 * Dùng react-hook-form + @hookform/resolvers/zod.
 */
import { z } from "zod";

/** Error keys (i18n) — match với messages/{vi,en}/customers.json */
export type CustomerFieldErrorKey =
  | "nameRequired";

/** Required name field (1-255 chars) */
const nameField = z.string().min(1, "nameRequired").max(255);

/** Optional string (không validate format) */
const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

/**
 * Create form schema.
 */
export const createCustomerFormSchema = z.object({
  name: nameField,
  phone: optionalString(20),
  email: optionalString(255),
  address: optionalString(500),
  notes: optionalString(1000),
});

/**
 * Edit form schema — tất cả fields optional (PATCH-style).
 */
export const editCustomerFormSchema = createCustomerFormSchema.partial();

/** Inferred types */
export type CreateCustomerFormData = z.infer<typeof createCustomerFormSchema>;
export type EditCustomerFormData = z.infer<typeof editCustomerFormSchema>;

/** Default values cho react-hook-form */
export const CUSTOMER_FORM_DEFAULTS: Partial<CreateCustomerFormData> = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};
