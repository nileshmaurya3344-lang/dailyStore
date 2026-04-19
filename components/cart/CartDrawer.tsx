'use client'

import { createPortal } from 'react-dom'
import Link from 'next/link'
import { X, ShoppingCart, Trash2, Minus, Plus, ChevronRight, Clock3 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, getTotalPrice, getTotalItems } = useCartStore()

  if (typeof document === 'undefined') return null

  const subtotal = getTotalPrice()
  const deliveryCharge = subtotal >= 199 ? 0 : 30
  const total = subtotal + deliveryCharge

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-[rgba(24,14,36,0.54)] backdrop-blur-sm"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}
        onClick={closeCart}
      />

      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-[var(--surface)] shadow-2xl sm:w-[430px]"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="purple-shell px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--primary)]">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Your cart</h2>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Ready to checkout</p>
              </div>
            </div>
            <button onClick={closeCart} className="rounded-xl border border-white/10 bg-white/10 p-2 text-white">
              <X size={18} />
            </button>
          </div>

          {getTotalItems() > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <span className="font-semibold text-white/75">Items in cart</span>
              <span className="font-black">{getTotalItems()}</span>
            </div>
          )}
        </div>

        {subtotal > 0 && subtotal < 199 && (
          <div className="mx-4 mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--surface-soft)] p-4 text-sm">
            <p className="font-semibold text-[var(--text)]">Add {formatPrice(199 - subtotal)} more for free delivery</p>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div
                className="h-2 rounded-full bg-[var(--accent)]"
                style={{ width: `${(subtotal / 199) * 100}%`, transition: 'width 0.3s' }}
              />
            </div>
          </div>
        )}

        {subtotal >= 199 && (
          <div className="mx-4 mt-4 rounded-2xl border border-[rgba(19,138,82,0.18)] bg-[var(--success-soft)] p-3 text-center text-sm font-semibold text-[var(--success)]">
            Free delivery unlocked
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingCart size={56} className="text-[var(--stroke-strong)]" />
              <div>
                <p className="text-lg font-bold text-[var(--text)]">Your cart is empty</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Add groceries to get started</p>
              </div>
              <button onClick={closeCart} className="btn-primary text-sm">
                Browse products
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="surface-card flex gap-3 rounded-[22px] p-3">
                <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-soft)]">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingCart size={24} className="text-[var(--stroke-strong)]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold leading-tight text-[var(--text)]">{item.product.name}</p>
                  {item.product.weight_value && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {item.product.weight_value}
                      {item.product.weight_unit}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[var(--text)]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--stroke)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                      </button>
                      <span className="w-5 text-center text-sm font-extrabold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--success)] text-white"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--stroke)] p-4">
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--text)]">
              <Clock3 size={16} className="text-[var(--accent)]" />
              Delivery in 10-20 mins, or choose a morning slot at checkout
            </div>

            <div className="space-y-2 text-sm">
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
              <div className="flex justify-between border-t border-[var(--stroke)] pt-3 text-base font-extrabold text-[var(--text)]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={closeCart}>
              <button className="btn-primary mt-4 flex w-full items-center justify-center gap-2 py-3 text-base">
                Proceed to checkout
                <ChevronRight size={18} />
              </button>
            </Link>
          </div>
        )}
      </aside>
    </>,
    document.body
  )
}
