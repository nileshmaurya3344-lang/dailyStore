'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthPage() {
  const { user, signInWithEmail, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setError('')
    const response = await signInWithEmail(email)
    if (response.error) {
      setError(response.error.message)
    } else {
      setSent(true)
    }
    setSending(false)
  }

  if (user) {
    return (
      <div className="container-app pb-12">
        <div className="surface-card rounded-[34px] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
            <Check size={36} />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">You are already signed in</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{user.full_name || user.email}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="btn-primary">
              Open dashboard
            </Link>
            <button onClick={signOut} className="btn-outline">
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app pb-12">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="purple-shell subtle-grid overflow-hidden rounded-[34px] p-8 text-white">
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">Sign in</p>
            <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em]">
              Continue your grocery orders with one secure magic link.
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/78">
              Login keeps your addresses, order history, and checkout flow connected across the Zepto-style grocery experience.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {['Save addresses', 'Track live orders', 'Return to checkout fast'].map(item => (
              <div key={item} className="rounded-[24px] bg-white/10 p-4 text-sm font-semibold">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card rounded-[34px] p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Magic link</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[var(--text)]">Login or create an account</h2>
            </div>
          </div>

          {sent ? (
            <div className="rounded-[28px] bg-[var(--success-soft)] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--success)]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-5 text-xl font-black tracking-[-0.04em] text-[var(--text)]">Check your inbox</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                We sent a secure sign-in link to <strong>{email}</strong>. Open it on this device to continue.
              </p>
              <button onClick={() => setSent(false)} className="btn-outline mt-5">
                Use another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <label className="block text-sm font-semibold text-[var(--text)]">
                Email address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="mt-2 h-[52px] w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 text-sm font-semibold outline-none"
                />
              </label>
              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              <button type="submit" disabled={sending} className="btn-primary flex w-full justify-center py-3">
                {sending ? 'Sending...' : 'Send magic link'}
                {!sending && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
