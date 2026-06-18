export interface UserInfo {
  id: string
  email: string
  name: string | null
  role: string
  joinedAt: string
  emailVerifiedAt: string | null
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}
