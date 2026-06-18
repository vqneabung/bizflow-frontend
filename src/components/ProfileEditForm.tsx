'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useUpdateUserMutation } from '@/lib/query/profile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { UserInfo } from '@/lib/types'
import { getErrorMessage } from '@/lib/types'

interface ProfileEditFormProps {
  user: UserInfo
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const t = useTranslations('profile')
  const c = useTranslations('common')

  const [name, setName] = useState(user.name ?? '')
  const mutation = useUpdateUserMutation()

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t('edit.nameRequired'))
      return
    }
    try {
      await mutation.mutateAsync({ name: name.trim() })
      toast.success(t('edit.saved'))
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('edit.error')))
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-zinc-900 mb-4">{t('edit.title')}</h3>
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="profile-name">{t('edit.name')}</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('edit.namePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('edit.email')}</Label>
          <p className="text-sm text-zinc-500">{user.email}</p>
          <p className="text-xs text-zinc-400">{t('edit.emailNote')}</p>
        </div>

        <Button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="mt-2"
        >
          {mutation.isPending ? t('edit.saving') : t('edit.save')}
        </Button>
      </div>
    </div>
  )
}
