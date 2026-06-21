'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import SearchBar from '@/components/ui/search-bar'
import { Button } from '@/components/ui/button'
import EmployeesTable from './EmployeesTable'
import CreateEmployeeDialog from './CreateEmployeeDialog'
import ResetPasswordDialog from './ResetPasswordDialog'
import EmployeeDeactivateDialog from './EmployeeDeactivateDialog'
import { useEmployeesQuery, useDeactivateEmployeeMutation } from '@/lib/query/employees'
import { getErrorMessage } from '@/lib/types'
import type { Employee } from '@/lib/types'

export default function EmployeesPageClient() {
  const t = useTranslations('employees')
  const d = useTranslations('dashboard')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<Employee | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Employee | null>(null)

  const { data, isPending, isError, error, refetch } = useEmployeesQuery({
    search: search || undefined,
    page,
    size: 20,
  })

  const deactivateMutation = useDeactivateEmployeeMutation()

  const employees = data?.data ?? []
  const pagination = data?.pagination ?? null
  const hasEmployees = employees.length > 0

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id)
      toast.success(t('messages.deactivated'))
      setDeactivateTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err, t('messages.deactivateFailed')))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs text-zinc-400 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
            <span className="mx-1">/</span>
            <span className="text-zinc-700 font-medium">{t('title')}</span>
          </nav>
          <h2 className="text-lg font-semibold text-zinc-900">{t('title')}</h2>
          <p className="text-sm text-zinc-500">{t('description')}</p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          {t('create')}
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        placeholder={t('search')}
      />

      {isPending ? (
        <div className="animate-pulse space-y-3">
          <div className="hidden md:grid md:grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr] gap-4 px-4 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-zinc-200 rounded" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, row) => (
            <div
              key={row}
              className="bg-white rounded-xl border border-zinc-200 p-4 md:grid md:grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr] md:gap-4 md:items-center"
            >
              <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2 md:mb-0" />
              <div className="h-4 bg-zinc-200 rounded w-2/3 mb-2 md:mb-0" />
              <div className="h-4 bg-zinc-200 rounded w-1/2 mb-2 md:mb-0" />
              <div className="h-4 bg-zinc-200 rounded w-16 mb-2 md:mb-0" />
              <div className="h-8 bg-zinc-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">❌</span>
          <p className="text-sm text-zinc-600 mb-4">
            {getErrorMessage(error, t('errors.loadFailed'))}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            {t('errors.loadFailedAction')}
          </button>
        </div>
      ) : !hasEmployees ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <span className="text-4xl mb-3 block">👥</span>
          <p className="text-sm font-medium text-zinc-900 mb-1">{t('table.empty')}</p>
          <p className="text-sm text-zinc-500 mb-5">{t('empty.description')}</p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            {t('create')}
          </Button>
        </div>
      ) : (
        <EmployeesTable
          employees={employees}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          onResetPassword={setResetTarget}
          onDeactivate={setDeactivateTarget}
        />
      )}

      <CreateEmployeeDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <ResetPasswordDialog
        isOpen={!!resetTarget}
        employeeId={resetTarget?.id ?? null}
        employeeName={resetTarget?.name ?? resetTarget?.email ?? null}
        onClose={() => setResetTarget(null)}
      />
      <EmployeeDeactivateDialog
        isOpen={!!deactivateTarget}
        employee={deactivateTarget}
        isPending={deactivateMutation.isPending}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
      />
    </div>
  )
}