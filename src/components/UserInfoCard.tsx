'use client'

import { useTranslations } from 'next-intl'
import type { UserInfo } from '@/lib/types'
import { Card, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const roleVariant: Record<string, 'default' | 'secondary' | 'warning' | 'info'> = {
  OWNER: 'default',
  EMPLOYEE: 'info',
  ADMIN: 'warning',
}

export default function UserInfoCard({ user }: { user: UserInfo }) {
  const c = useTranslations('common')

  const displayName = user.name ?? user.email
  const initial = displayName.charAt(0).toUpperCase()

  const roleKey = user.role === 'OWNER' ? 'owner' : user.role === 'EMPLOYEE' ? 'employee' : 'admin'
  const variant = roleVariant[user.role] ?? 'secondary'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 bg-primary text-primary-foreground text-2xl font-bold">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 min-w-0">
          <h2 className="text-lg font-semibold text-zinc-900 truncate">{displayName}</h2>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <Badge variant={variant}>{c(`role.${roleKey}`)}</Badge>
        </div>
      </CardHeader>
    </Card>
  )
}