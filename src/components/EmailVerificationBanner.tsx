'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { X, AlertTriangle } from 'lucide-react'
import type { UserInfo } from '@/lib/types'

export default function EmailVerificationBanner({
  user,
}: {
  user: UserInfo
}) {
  const [dismissed, setDismissed] = useState(false)
  const t = useTranslations('verification')

  if (user.emailVerifiedAt || dismissed) return null

  function handleResend() {
    toast.info('Chức năng đang phát triển')
  }

  return (
    <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 border border-amber-200 sm:mx-6">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">{t('title')}</p>
        <p className="mt-1 text-sm text-amber-700">{t('message')}</p>
        <button
          type="button"
          onClick={handleResend}
          className="mt-2 text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
        >
          {t('resend')}
        </button>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-lg p-1 text-amber-500 hover:bg-amber-100 hover:text-amber-600"
        aria-label={t('dismiss')}
      >
        <X className="size-5" />
      </button>
    </div>
  )
}
