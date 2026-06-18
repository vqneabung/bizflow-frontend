import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '@/lib/api/auth'
import type { UserInfo } from '@/lib/types'

export const profileKeys = {
  me: ['auth', 'me'] as const,
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string }) => updateUser(data),
    onSuccess: (user: UserInfo) => {
      queryClient.setQueryData(profileKeys.me, user)
    },
  })
}
