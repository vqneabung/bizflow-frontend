export interface UnitResponse {
  id: string
  name: string
  description: string | null
  ownerId: string | null
}

export interface CategoryResponse {
  id: string
  name: string
  description: string | null
  ownerId: string | null
}

export interface CategoryOption {
  id: string
  name: string
}
