/**
 * stock-import-schema.ts — Zod schemas cho Stock Import form validation.
 */
import { z } from "zod";

/** Error keys (i18n) — match với messages/{vi,en}.json stockImports.errors */
export type StockImportFieldErrorKey =
  | "atLeastOneItem"
  | "productRequired"
  | "quantityRequired"
  | "unitCostRequired";

/** 1 dòng item trong phiếu nhập */
const stockImportItemSchema = z.object({
  productId: z.string().min(1, "productRequired"),
  productName: z.string().optional(), // display only
  quantity: z.coerce.number().positive("quantityRequired"),
  unitCost: z.coerce.number().positive("unitCostRequired"),
});

export type StockImportItemFormData = z.infer<typeof stockImportItemSchema>;

/**
 * Create stock import schema.
 */
export const createStockImportFormSchema = z.object({
  referenceNumber: z.string().max(50).optional().or(z.literal("")),
  supplier: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  importDate: z.string().optional().or(z.literal("")),
  items: z.array(stockImportItemSchema).min(1, "atLeastOneItem"),
});

export type CreateStockImportFormData = z.infer<typeof createStockImportFormSchema>;

/** Default values */
export const STOCK_IMPORT_FORM_DEFAULTS: Partial<CreateStockImportFormData> = {
  supplier: "",
  notes: "",
  importDate: "",
  referenceNumber: "",
  items: [{ productId: "", productName: "", quantity: 0, unitCost: 0 }],
};
