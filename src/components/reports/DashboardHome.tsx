'use client'

import { useTranslations } from 'next-intl'
import { ReportStatCard } from '@/components/reports/ReportStatCard'
import { RevenueChart } from '@/components/reports/RevenueChart'
import { DashboardSkeleton } from '@/components/reports/DashboardSkeleton'
import { useOverviewQuery, useRevenueQuery } from '@/lib/query/reports'
import { Link } from '@/i18n/navigation'

interface DashboardHomeProps {
  userName: string
  userEmail: string
}

export function DashboardHome({ userName, userEmail }: DashboardHomeProps) {
  const t = useTranslations('dashboard')
  const rt = useTranslations('reports')

  const { data: overview, isPending, isError } = useOverviewQuery()
  const revenue = useRevenueQuery('30d')

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN').format(n) + '₫'

  const formatDate = (d: string) => {
    const date = new Date(d)
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)
  }

  if (isPending) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      {/* User greeting */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-lg font-semibold text-zinc-900">
          {t('greeting', { name: userName })}
        </p>
        <p className="mt-1 text-sm text-zinc-500">{userEmail}</p>
      </div>

      {/* Stat cards */}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {t('errors.overviewFailed')}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <ReportStatCard
            icon="📦"
            label={rt('overview.totalProducts')}
            value={overview?.totalProducts?.toLocaleString() ?? '0'}
          />
          <ReportStatCard
            icon="🛒"
            label={rt('overview.ordersThisMonth')}
            value={overview?.totalOrdersThisMonth?.toLocaleString() ?? '0'}
          />
          <ReportStatCard
            icon="💰"
            label={rt('overview.revenueThisMonth')}
            value={overview ? formatPrice(overview.totalRevenueThisMonth) : '0₫'}
          />
          <ReportStatCard
            icon="👥"
            label={rt('overview.totalCustomers')}
            value={overview?.totalCustomers?.toLocaleString() ?? '0'}
          />
          <ReportStatCard
            icon="⚠️"
            label={rt('overview.lowStock')}
            value={overview?.lowStockCount?.toLocaleString() ?? '0'}
            trend={overview && overview.lowStockCount > 0 ? 'down' : 'neutral'}
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/orders/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + {t('actions.createOrder')}
        </Link>
        <Link
          href="/dashboard/products/create"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
        >
          + {t('actions.createProduct')}
        </Link>
        <Link
          href="/dashboard/stock-imports/create"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
        >
          + {t('actions.stockImport')}
        </Link>
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">{t('chart.title')}</h3>
          <Link
            href="/dashboard/reports"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {t('chart.viewAll')}
          </Link>
        </div>
        <RevenueChart
          data={revenue.data?.daily ?? []}
          formatDate={formatDate}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  )
}
