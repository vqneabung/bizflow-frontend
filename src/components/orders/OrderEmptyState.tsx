'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function OrderEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string
  description: string
  actionLabel: string
  actionHref: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">🛒</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">{description}</p>
      <Button asChild>
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  )
}
