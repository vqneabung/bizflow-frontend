/**
 * Register page — Đăng ký tài khoản Bizflow.
 *
 * Flow:
 * 1. User nhập email + name + password + confirmPassword
 * 2. Client-side validation cơ bản (email format, password min 6, match)
 * 3. Submit → gọi authClient.registerUser() → proxy → Spring Boot
 * 4. Thành công: set cookie → redirect /dashboard
 * 5. Thất bại: hiển thị error (duplicate email, invalid...)
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/lib/api/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Client-side validation trước khi gửi request
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      await registerUser(email, password, name || undefined)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-4xl">🏪</span>
          <h1 className="text-2xl font-bold text-zinc-900">Tạo tài khoản</h1>
          <p className="text-sm text-zinc-500">
            Bắt đầu sử dụng Bizflow miễn phí
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Tên hiển thị
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-zinc-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
