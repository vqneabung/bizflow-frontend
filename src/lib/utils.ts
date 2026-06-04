import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn() — Merge Tailwind classes, ưu tiên class sau (shadcn pattern).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
