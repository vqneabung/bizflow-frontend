'use client'

import { useTranslations } from 'next-intl'
import { ReportStatCard } from '@/components/reports/ReportStatCard'
import { RevenueChart } from '@/components/reports/RevenueChart'
import { BestSellingTable } from '@/components/reports/BestSellingTable'
import { InventoryCard } from '@/components/reports/InventoryCard'
import { DebtTable } from '@/components/reports/DebtTable'
import type { InventoryReport } from '@/lib/types/api/report'
import {
  useOverviewQuery,
  useRevenueQuery,
  useBestSellingQuery,
  useInventoryQuery,
  useDebtQuery,
} from '@/lib/query/reports'
import { useState } from 'react'

type Tab = 'overview' | 'revenue' | 'best-selling' | 'inventory' | 'debt'

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'best-selling', label: 'Best Selling' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'debt', label: 'Debt' },
]

const revenueRanges = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'thisMonth', label: 'This Month' },
] as const

export default function ReportsPage() {
  const t = useTranslations('reports')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [revenueRange, setRevenueRange] = useState<string>('30d')

  const overview = useOverviewQuery()
  const revenue = useRevenueQuery(revenueRange)
  const bestSelling = useBestSellingQuery(10)
  const inventory = useInventoryQuery()
  const debt = useDebtQuery()

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN').format(n) + '₫'

  const formatDate = (d: string) => {
    const date = new Date(d)
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t('subtitle')}</p>
      </div>

      {/* Stat cards (shown always) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <ReportStatCard
          icon="📦"
          label={t('overview.totalProducts')}
          value={overview.data?.totalProducts?.toLocaleString() ?? '—'}
        />
        <ReportStatCard
          icon="🛒"
          label={t('overview.ordersThisMonth')}
          value={overview.data?.totalOrdersThisMonth?.toLocaleString() ?? '—'}
          trend={overview.data?.totalOrdersThisMonth && overview.data.totalOrdersThisMonth > 0 ? 'up' : 'neutral'}
        />
        <ReportStatCard
          icon="💰"
          label={t('overview.revenueThisMonth')}
          value={overview.data ? formatPrice(overview.data.totalRevenueThisMonth) : '—'}
          trend={overview.data?.totalRevenueThisMonth && overview.data.totalRevenueThisMonth > 0 ? 'up' : 'neutral'}
        />
        <ReportStatCard
          icon="👥"
          label={t('overview.totalCustomers')}
          value={overview.data?.totalCustomers?.toLocaleString() ?? '—'}
        />
        <ReportStatCard
          icon="⚠️"
          label={t('overview.lowStock')}
          value={overview.data?.lowStockCount?.toLocaleString() ?? '—'}
          trend={overview.data?.lowStockCount && overview.data.lowStockCount > 0 ? 'down' : 'neutral'}
          change={overview.data?.lowStockCount ? `${overview.data.lowStockCount} items` : undefined}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-zinc-800">{t('revenue.title')}</h2>
                {revenue.data && (
                  <RevenueChart
                    data={revenue.data.daily}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                  />
                )}
              </div>
              <div>
                <h2 className="mb-3 text-lg font-semibold text-zinc-800">{t('bestSelling.title')}</h2>
                {bestSelling.data && (
                  <BestSellingTable data={bestSelling.data?.items ?? []} formatPrice={formatPrice} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {revenueRanges.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRevenueRange(r.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    revenueRange === r.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <RevenueChart data={revenue.data?.daily ?? []} formatDate={formatDate} formatPrice={formatPrice} />
          </div>
        )}

        {/* Best Selling Tab */}
        {activeTab === 'best-selling' && (
                  <BestSellingTable data={bestSelling.data?.items ?? []} formatPrice={formatPrice} />
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <InventoryCard
            data={
              inventory.data ?? ({
                totalProducts: 0,
                totalValue: 0,
                lowStockCount: 0,
                lowStockProducts: [],
                byCategory: [],
              } as InventoryReport)
            }
            formatPrice={formatPrice}
          />
        )}

        {/* Debt Tab */}
        {activeTab === 'debt' && <DebtTable data={debt.data?.customers ?? []} formatPrice={formatPrice} />}
      </div>
    </div>
  )
}
