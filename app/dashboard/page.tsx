'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { LogOut, MapPin, Package, RefreshCcw, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { Address, Order, Subscription } from '@/lib/types'
import { formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils'

type Tab = 'orders' | 'subscriptions' | 'addresses' | 'wallet'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = user

    if (!currentUser) {
      router.push('/auth')
      return
    }

    const userId = currentUser.id

    async function loadDashboard() {
      setLoading(true)
      const [orderResponse, addressResponse, subscriptionResponse] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', userId),
        supabase.from('subscriptions').select('*, product:products(*)').eq('user_id', userId),
      ])

      setOrders((orderResponse.data as Order[]) ?? [])
      setAddresses(addressResponse.data ?? [])
      setSubscriptions((subscriptionResponse.data as Subscription[]) ?? [])
      setLoading(false)
    }

    void loadDashboard()
  }, [router, user])

  if (!user) return null

  return (
    <div className="container-app space-y-6 pb-12">
      <section className="purple-shell subtle-grid overflow-hidden rounded-[34px] p-6 text-white md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">Account</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">{user.full_name || 'My dashboard'}</h1>
            <p className="mt-2 text-sm text-white/74">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Orders</p>
            <p className="mt-2 text-3xl font-black">{orders.length}</p>
          </div>
          <div className="rounded-[24px] bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Subscriptions</p>
            <p className="mt-2 text-3xl font-black">{subscriptions.filter(item => item.is_active).length}</p>
          </div>
          <div className="rounded-[24px] bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Wallet</p>
            <p className="mt-2 text-3xl font-black">{formatPrice(user.wallet_balance)}</p>
          </div>
        </div>
      </section>

      <div className="scroll-x flex gap-2 pb-2">
        {[
          { key: 'orders' as const, label: 'Orders' },
          { key: 'subscriptions' as const, label: 'Subscriptions' },
          { key: 'addresses' as const, label: 'Addresses' },
          { key: 'wallet' as const, label: 'Wallet' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab === item.key
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--stroke)] bg-white text-[var(--text-muted)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-28 rounded-[24px]" />
          ))}
        </div>
      ) : (
        <>
          {tab === 'orders' && (
            <section className="space-y-3">
              {orders.length === 0 ? (
                <div className="surface-card rounded-[30px] p-10 text-center">
                  <Package size={48} className="mx-auto text-[var(--stroke-strong)]" />
                  <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-[var(--text)]">No orders yet</h2>
                  <Link href="/" className="btn-primary mt-5">
                    Start shopping
                  </Link>
                </div>
              ) : (
                orders.map(order => (
                  <article key={order.id} className="surface-card rounded-[28px] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black tracking-[-0.04em] text-[var(--text)]">Order #{order.order_number}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--stroke)] pt-4">
                      <p className="text-sm font-semibold text-[var(--text-muted)]">
                        {order.delivery_type === 'morning' ? 'Morning slot' : 'Instant delivery'} - {order.payment_method.toUpperCase()}
                      </p>
                      <p className="text-lg font-black text-[var(--text)]">{formatPrice(order.total_price)}</p>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {tab === 'subscriptions' && (
            <section className="space-y-3">
              {subscriptions.length === 0 ? (
                <div className="surface-card rounded-[30px] p-10 text-center">
                  <RefreshCcw size={48} className="mx-auto text-[var(--stroke-strong)]" />
                  <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-[var(--text)]">No active subscriptions</h2>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">You can still order daily essentials directly from the store.</p>
                </div>
              ) : (
                subscriptions.map(subscription => (
                  <article key={subscription.id} className="surface-card rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-black tracking-[-0.03em] text-[var(--text)]">{subscription.product?.name}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {subscription.frequency} - Qty {subscription.quantity}
                        </p>
                      </div>
                      <span className={`status-badge ${subscription.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                        {subscription.is_paused ? 'Paused' : subscription.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {tab === 'addresses' && (
            <section className="space-y-3">
              {addresses.length === 0 ? (
                <div className="surface-card rounded-[30px] p-10 text-center">
                  <MapPin size={48} className="mx-auto text-[var(--stroke-strong)]" />
                  <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-[var(--text)]">No saved addresses</h2>
                  <Link href="/checkout" className="btn-primary mt-5">
                    Add an address
                  </Link>
                </div>
              ) : (
                addresses.map(address => (
                  <article key={address.id} className="surface-card rounded-[28px] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-black tracking-[-0.03em] text-[var(--text)]">{address.full_name}</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                          {address.address_line}, {address.city} - {address.pincode}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{address.phone}</p>
                      </div>
                      {address.is_default && (
                        <span className="status-badge bg-[var(--surface-soft)] text-[var(--primary)]">Default</span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {tab === 'wallet' && (
            <section className="surface-card rounded-[30px] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Wallet balance</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">{formatPrice(user.wallet_balance)}</h2>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--text-muted)]">
                Wallet history is empty right now. This section is ready to surface future balance and credit transactions.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container-app pb-12"><div className="skeleton h-48 rounded-[30px]" /></div>}>
      <DashboardPageContent />
    </Suspense>
  )
}
