export type UserRole = 'USER' | 'EMPLOYEE' | 'ADMIN'

export interface UserInfo {
  id: string
  email: string
  name: string | null
  role: UserRole
  joinedAt: string
  emailVerifiedAt: string | null
  isActive: boolean
  ownerId: string | null
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}
