'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'

type DeliveryType = 'instant' | 'morning'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('instant')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [applying, setApplying] = useState(false)

  const subtotal = getTotalPrice()
  const deliveryCharge = subtotal >= 199 ? 0 : deliveryType === 'instant' ? 39 : 20
  const couponDiscount = couponApplied?.discount ?? 0
  const total = subtotal + deliveryCharge - couponDiscount

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplying(true)
    setCouponError('')

    try {
      const response = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (!response.data) {
        setCouponError('Invalid or expired coupon code')
      } else if (subtotal < response.data.min_order) {
        setCouponError(`Minimum order ${formatPrice(response.data.min_order)} required`)
      } else {
        const discount =
          response.data.discount_type === 'flat'
            ? Math.min(response.data.discount_value, response.data.max_discount || response.data.discount_value)
            : Math.min((subtotal * response.data.discount_value) / 100, response.data.max_discount || 9999)

        setCouponApplied({ code: couponCode.toUpperCase(), discount })
      }
    } catch {
      setCouponError('Unable to apply coupon right now')
    }

    setApplying(false)
  }

  if (items.length === 0) {
    return (
      <div className="container-app pb-12">
        <div className="surface-card rounded-[32px] p-10 text-center">
          <ShoppingBag size={64} className="mx-auto text-[var(--stroke-strong)]" />
          <h1 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">Your cart is empty</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Add groceries to start your order.</p>
          <Link href="/" className="btn-primary mt-6">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app space-y-6 pb-12">
      <section className="surface-card-strong rounded-[34px] p-6 md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Cart</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">Review your grocery basket</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Everything you add here stays synced with the drawer and checkout.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <section className="surface-card rounded-[30px] p-5">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <Truck size={18} />
              <h2 className="text-lg font-black tracking-[-0.04em]">Delivery type</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setDeliveryType('instant')}
                className={`rounded-[24px] border p-4 text-left ${
                  deliveryType === 'instant'
                    ? 'border-[var(--primary)] bg-[var(--surface-soft)]'
                    : 'border-[var(--stroke)] bg-white'
                }`}
              >
                <p className="font-bold text-[var(--text)]">Instant delivery</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">10-20 mins - {subtotal >= 199 ? 'Free' : formatPrice(39)}</p>
              </button>
              <button
                onClick={() => setDeliveryType('morning')}
                className={`rounded-[24px] border p-4 text-left ${
                  deliveryType === 'morning'
                    ? 'border-[var(--success)] bg-[var(--success-soft)]'
                    : 'border-[var(--stroke)] bg-white'
                }`}
              >
                <p className="font-bold text-[var(--text)]">Morning slot</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">By 7:00 AM - {subtotal >= 199 ? 'Free' : formatPrice(20)}</p>
              </button>
            </div>
          </section>

          <section className="space-y-3">
            {items.map(item => (
              <article key={item.product.id} className="surface-card rounded-[28px] p-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[22px] bg-[var(--surface-soft)]">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--stroke-strong)]">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-black tracking-[-0.03em] text-[var(--text)]">{item.product.name}</h2>
                    {item.product.brand && <p className="mt-1 text-sm text-[var(--text-muted)]">{item.product.brand}</p>}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-[var(--text)]">{formatPrice(item.product.price * item.quantity)}</p>
                        {item.product.mrp > item.product.price && (
                          <p className="text-xs font-semibold text-[var(--text-muted)] line-through">
                            {formatPrice(item.product.mrp * item.quantity)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--stroke)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-center gap-2 rounded-2xl bg-[var(--success)] px-2 py-2 text-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/10"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/10"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="surface-card rounded-[30px] p-5">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <Tag size={18} />
              <h2 className="text-lg font-black tracking-[-0.04em]">Apply coupon</h2>
            </div>
            {couponApplied ? (
              <div className="mt-4 flex items-center justify-between rounded-[22px] bg-[var(--success-soft)] px-4 py-4">
                <div>
                  <p className="font-black text-[var(--success)]">{couponApplied.code}</p>
                  <p className="text-sm text-[var(--success)]">You saved {formatPrice(couponApplied.discount)}</p>
                </div>
                <button onClick={() => setCouponApplied(null)} className="text-sm font-bold text-[var(--accent)]">
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={couponCode}
                  onChange={event => {
                    setCouponCode(event.target.value)
                    setCouponError('')
                  }}
                  placeholder="Enter coupon code"
                  className="h-[52px] flex-1 rounded-2xl border border-[var(--stroke)] bg-white px-4 text-sm font-semibold outline-none"
                />
                <button onClick={applyCoupon} disabled={applying} className="btn-primary min-w-[120px]">
                  {applying ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="mt-3 text-sm font-semibold text-red-600">{couponError}</p>}
          </section>
        </div>

        <aside>
          <div className="surface-card sticky top-44 rounded-[30px] p-5">
            <h2 className="text-lg font-black tracking-[-0.04em] text-[var(--text)]">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'font-semibold text-[var(--success)]' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                </span>
              </div>
              {couponApplied && (
                <div className="flex justify-between font-semibold text-[var(--success)]">
                  <span>Coupon</span>
                  <span>-{formatPrice(couponApplied.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--stroke)] pt-3 text-base font-black text-[var(--text)]">
                <span>Total</span>
                <span>{formatPrice(Math.max(total, 0))}</span>
              </div>
            </div>

            {subtotal < 199 && (
              <div className="mt-5 rounded-[22px] bg-[var(--warning-soft)] px-4 py-4 text-sm font-semibold text-[var(--text)]">
                Add {formatPrice(199 - subtotal)} more to unlock free delivery.
              </div>
            )}

            <Link href="/checkout" className="btn-primary mt-5 flex w-full justify-center py-3">
              Proceed to checkout
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
