'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingCart, Sparkles } from 'lucide-react'
import { Product } from '@/lib/types'
import { useCartStore } from '@/store/cartStore'
import { formatDiscount, formatPrice, formatWeight } from '@/lib/utils'
import { getProductCategoryName } from '@/lib/grocery'
import { showToast } from '@/components/ui/Toaster'

interface ProductCardProps {
  product: Product
  showDeliveryBadge?: boolean
}

export function ProductCard({ product, showDeliveryBadge = true }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find(item => item.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0
  const discount = formatDiscount(product.price, product.mrp)

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    addItem(product, 1)
    showToast(`${product.name} added to cart`)
  }

  const handleIncrease = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    updateQuantity(product.id, quantity + 1)
  }

  const handleDecrease = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    updateQuantity(product.id, quantity - 1)
  }

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <article className="product-card group">
        <div className="relative aspect-square bg-[linear-gradient(180deg,#ffffff_0%,#faf7ff_100%)] p-4">
          {discount > 0 && (
            <div className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
              {discount}% off
            </div>
          )}

          {showDeliveryBadge && product.is_morning_delivery_available && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full border border-[rgba(19,138,82,0.18)] bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--success)]">
              <Sparkles size={10} />
              Morning slot
            </div>
          )}

          <div className="flex h-full items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-[var(--surface-soft)] text-[var(--stroke-strong)]">
                <ShoppingCart size={44} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--primary)]/70">
              {product.brand || getProductCategoryName(product)}
            </p>
            <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-[15px] font-extrabold leading-[1.35] text-[var(--text)]">
              {product.name}
            </h3>
            <p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">
              {formatWeight(product.weight_value, product.weight_unit) || 'Everyday grocery essential'}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--stroke)] pt-3">
            <div>
              <p className="text-lg font-black tracking-[-0.03em] text-[var(--text)]">{formatPrice(product.price)}</p>
              {product.mrp > product.price && (
                <p className="text-xs font-semibold text-[var(--text-muted)] line-through">{formatPrice(product.mrp)}</p>
              )}
            </div>

            <div onClick={event => event.preventDefault()}>
              {quantity === 0 ? (
                <button 
                  onClick={handleAdd} 
                  disabled={product.stock === 0} 
                  className="h-10 min-w-[90px] rounded-xl bg-[#ff2b85] text-[11px] font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#db1668] hover:translate-y-[-2px] active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {product.stock === 0 ? 'Out' : 'Add'}
                </button>
              ) : (
                <div className="flex h-10 items-center gap-2 rounded-xl bg-[#240643] p-1 text-white shadow-lg">
                  <button onClick={handleDecrease} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:scale-90">
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-6 text-center text-xs font-black">{quantity}</span>
                  <button onClick={handleIncrease} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:scale-90">
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
