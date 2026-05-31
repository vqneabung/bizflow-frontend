/**
 * navigation.ts — Navigation helpers có locale awareness.
 *
 * Thay thế các import từ 'next/navigation' và 'next/link' bằng phiên bản
 * tự động giữ locale prefix trong URL.
 *
 * Dùng:
 *   import { Link, redirect, usePathname, useRouter } from '@/i18n/navigation'
 *
 * Thay vì:
 *   import Link from 'next/link'
 *   import { usePathname, useRouter } from 'next/navigation'
 */
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
