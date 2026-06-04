'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  statKey: string
  icon: string
  value: string
}

export default function StatCard({ statKey, icon, value }: StatCardProps) {
  const t = useTranslations('dashboard.stats')

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t(statKey)}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <span className="text-2xl shrink-0">{icon}</span>
      </div>
    </Card>
  )
}