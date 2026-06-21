'use client'

import { useTranslations } from 'next-intl'
import { Check, X, KeyRound, UserX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Employee, PaginationMeta } from '@/lib/types'

interface EmployeesTableProps {
  employees: Employee[]
  pagination: PaginationMeta | null
  page: number
  onPageChange: (page: number) => void
  onResetPassword: (employee: Employee) => void
  onDeactivate: (employee: Employee) => void
}

export default function EmployeesTable({
  employees,
  pagination,
  page,
  onPageChange,
  onResetPassword,
  onDeactivate,
}: EmployeesTableProps) {
  const t = useTranslations('employees')

  const totalPages = pagination?.totalPages ?? 1
  const canPrev = page > 1
  const canNext = page < totalPages
  const from = pagination ? (page - 1) * pagination.size + 1 : 0
  const to = pagination
    ? Math.min(page * pagination.size, pagination.totalElements)
    : 0

  return (
    <div className="space-y-3">
      <div className="hidden md:grid md:grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr] gap-4 px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <div>{t('table.name')}</div>
        <div>{t('table.email')}</div>
        <div>{t('table.createdAt')}</div>
        <div>{t('table.status')}</div>
        <div className="text-right">{t('table.actions')}</div>
      </div>

      {employees.map((employee) => (
        <div
          key={employee.id}
          className="bg-white rounded-xl border border-zinc-200 p-4 md:grid md:grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr] md:gap-4 md:items-center hover:border-brand-500/30 transition-colors"
        >
          <div className="text-sm font-medium text-zinc-900 truncate">
            {employee.name ?? '—'}
          </div>
          <div className="text-sm text-zinc-600 mt-1 md:mt-0 truncate">
            {employee.email}
          </div>
          <div className="text-sm text-zinc-600 mt-1 md:mt-0">
            {new Date(employee.joinedAt).toLocaleDateString('vi-VN')}
          </div>
          <div className="mt-1 md:mt-0">
            {employee.isActive ? (
              <Badge variant="success" className="inline-flex items-center gap-1">
                <Check className="h-3 w-3" />
                {t('status.active')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="inline-flex items-center gap-1">
                <X className="h-3 w-3" />
                {t('status.inactive')}
              </Badge>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-2 md:mt-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onResetPassword(employee)}
              className="text-zinc-700 hover:text-brand-700"
              aria-label={t('actions.resetPassword')}
            >
              <KeyRound className="h-4 w-4" />
              <span className="hidden lg:inline">{t('actions.resetPassword')}</span>
            </Button>
            {employee.isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(employee)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                aria-label={t('actions.deactivate')}
              >
                <UserX className="h-4 w-4" />
                <span className="hidden lg:inline">{t('actions.deactivate')}</span>
              </Button>
            )}
          </div>
        </div>
      ))}

      {pagination && pagination.totalElements > 0 && (
        <div className="flex items-center justify-between px-4 pt-2 text-sm text-zinc-600">
          <span>
            {t('pagination.summary', {
              from,
              to,
              total: pagination.totalElements,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!canPrev}
            >
              {t('pagination.prev')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!canNext}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}