'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Minus, Plus, ShoppingCart, Sparkles, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Product } from '@/lib/types'
import { useCartStore } from '@/store/cartStore'
import { ProductCard } from '@/components/product/ProductCard'
import { formatDiscount, formatPrice, formatWeight, getDeliveryDate } from '@/lib/utils'
import { getProductCategoryName } from '@/lib/grocery'
import { showToast } from '@/components/ui/Toaster'

type DeliveryType = 'instant' | 'morning'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('instant')

  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find(item => item.product.id === id)
  const quantity = cartItem?.quantity ?? 0

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      const response = await supabase.from('products').select('*, category:categories(*)').eq('id', id).single()

      if (response.data) {
        const nextProduct = response.data as Product
        setProduct(nextProduct)
        setDeliveryType(nextProduct.is_morning_delivery_available ? 'morning' : 'instant')

        const relatedResponse = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .eq('category_id', nextProduct.category_id)
          .neq('id', nextProduct.id)
          .limit(8)

        setRelatedProducts((relatedResponse.data as Product[]) ?? [])
      }

      setLoading(false)
    }

    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div className="container-app pb-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="skeleton h-[460px] rounded-[30px]" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-32 rounded-full" />
            <div className="skeleton h-12 rounded-[18px]" />
            <div className="skeleton h-28 rounded-[24px]" />
            <div className="skeleton h-20 rounded-[24px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-app pb-12">
        <div className="surface-card rounded-[30px] p-10 text-center">
          <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--text)]">Product not found</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">The item you requested is unavailable right now.</p>
          <Link href="/" className="btn-primary mt-6">
            Go home
          </Link>
        </div>
      </div>
    )
  }

  const discount = formatDiscount(product.price, product.mrp)

  const handleAddToCart = () => {
    addItem(product, 1)
    showToast(`${product.name} added to cart`)
  }

  return (
    <div className="container-app space-y-8 pb-12">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)]"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="surface-card-strong rounded-[34px] p-6">
          <div className="relative flex min-h-[420px] items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#ffffff_0%,#faf7ff_100%)] p-6">
            {discount > 0 && (
              <div className="absolute left-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                {discount}% off
              </div>
            )}
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="max-h-[360px] w-full object-contain" />
            ) : (
              <div className="flex h-60 w-60 items-center justify-center rounded-full bg-[var(--surface-soft)]">
                <ShoppingCart size={64} className="text-[var(--stroke-strong)]" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card rounded-[30px] p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">
              {product.brand || getProductCategoryName(product)}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">{product.name}</h1>
            <p className="mt-3 text-sm font-semibold text-[var(--text-muted)]">
              {formatWeight(product.weight_value, product.weight_unit) || 'Everyday grocery essential'}
            </p>
            {product.description && <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{product.description}</p>}

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black tracking-[-0.06em] text-[var(--text)]">{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-lg font-semibold text-[var(--text-muted)] line-through">{formatPrice(product.mrp)}</span>
              )}
            </div>
          </div>

          <div className="surface-card rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black tracking-[-0.04em] text-[var(--text)]">Delivery options</h2>
                <p className="text-sm text-[var(--text-muted)]">Choose how you want this item delivered.</p>
              </div>
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
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <Truck size={18} />
                  <span className="font-bold">Instant delivery</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Today in 10-20 mins</p>
              </button>
              <button
                onClick={() => product.is_morning_delivery_available && setDeliveryType('morning')}
                disabled={!product.is_morning_delivery_available}
                className={`rounded-[24px] border p-4 text-left ${
                  deliveryType === 'morning'
                    ? 'border-[var(--success)] bg-[var(--success-soft)]'
                    : 'border-[var(--stroke)] bg-white'
                } ${!product.is_morning_delivery_available ? 'cursor-not-allowed opacity-55' : ''}`}
              >
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <Sparkles size={18} />
                  <span className="font-bold">Morning slot</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {product.is_morning_delivery_available ? getDeliveryDate('morning') : 'Unavailable for this item'}
                </p>
              </button>
            </div>
          </div>

          <div className="surface-card rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black tracking-[-0.04em] text-[var(--text)]">Add to cart</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {product.stock > 0 ? `${product.stock} units available` : 'Currently out of stock'}
                </p>
              </div>

              {quantity > 0 ? (
                <div className="flex items-center gap-2 rounded-2xl bg-[var(--success)] px-2 py-2 text-white">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/10"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-black">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-black/10"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-zepto min-w-[120px]">
                  {product.stock === 0 ? 'Sold out' : 'Add'}
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/cart" className="btn-primary">
                View cart
              </Link>
              <Link href="/checkout" className="btn-outline">
                Checkout now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="page-section">
          <div className="section-header">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">More like this</p>
              <h2 className="section-title mt-1 text-[var(--text)]">Related groceries</h2>
            </div>
          </div>
          <div className="scroll-x flex gap-4 pb-2">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} className="w-[220px] shrink-0 md:w-[250px]">
                <ProductCard product={relatedProduct} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
