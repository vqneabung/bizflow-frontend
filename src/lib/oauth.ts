/**
 * oauth.ts — OAuth2/OIDC config constants (server-side).
 *
 * Các route handler dùng chung constants từ file này thay vì redefine.
 * Tránh duplicate, dễ maintain khi config thay đổi.
 */

export const AUTH_ISSUER = process.env.AUTH_ISSUER ?? 'http://localhost:8080'
export const CLIENT_ID = process.env.AUTH_CLIENT_ID ?? 'nextjs-client'
export const CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET ?? 'nextjs-secret'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
export const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

// Token TTL — khớp với Spring Boot TokenSettings (24h access, 30d refresh).
export const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60
