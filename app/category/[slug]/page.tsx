'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Category, Product } from '@/lib/types'
import { ProductCard } from '@/components/product/ProductCard'
import { filterGroceryCategories, getGroceryCategoryConfig } from '@/lib/grocery'
import { formatPrice } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
]

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const config = getGroceryCategoryConfig(slug)

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('default')
  const [morningOnly, setMorningOnly] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(true)
  const [priceMax, setPriceMax] = useState(1000)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true)

      const [categoryResponse, selectedCategoryResponse] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('categories').select('*').eq('slug', slug).single(),
      ])

      if (categoryResponse.data) {
        setCategories(filterGroceryCategories(categoryResponse.data))
      }

      if (selectedCategoryResponse.data) {
        const productResponse = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .eq('category_id', selectedCategoryResponse.data.id)
          .order('created_at', { ascending: false })

        const nextProducts = (productResponse.data as Product[]) ?? []
        setProducts(nextProducts)
        setPriceMax(Math.max(...nextProducts.map(product => product.price), 250))
      } else {
        setProducts([])
      }

      setLoading(false)
    }

    loadCategoryData()
  }, [slug])

  const resetFilters = () => {
    setMorningOnly(false)
    setInStockOnly(true)
    setSortBy('default')
    setPriceMax(Math.max(...products.map(product => product.price), 250))
  }

  const maxSliderValue = Math.max(...products.map(product => product.price), 250)
  const filteredProducts = [...products]
    .filter(product => (morningOnly ? product.is_morning_delivery_available : true))
    .filter(product => (inStockOnly ? product.stock > 0 : true))
    .filter(product => product.price <= priceMax)

  if (sortBy === 'price_asc') {
    filteredProducts.sort((first, second) => first.price - second.price)
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((first, second) => second.price - first.price)
  } else if (sortBy === 'discount') {
    filteredProducts.sort(
      (first, second) =>
        (second.mrp - second.price) / Math.max(second.mrp, 1) - (first.mrp - first.price) / Math.max(first.mrp, 1)
    )
  }

  return (
    <div className="container-app space-y-6 pb-12">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--primary)]">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-[var(--text)]">{config?.name ?? 'Groceries'}</span>
      </div>

      <section className="surface-card-strong overflow-hidden rounded-[34px]">
        <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Grocery category</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[var(--text)] md:text-4xl">
              {config?.name ?? 'Groceries'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
              {config?.description ?? 'Browse grocery essentials with Zepto-style category browsing and working filters.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">
                {filteredProducts.length} products
              </span>
              <span className="rounded-full bg-[var(--success-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--success)]">
                Grocery only
              </span>
            </div>
          </div>
          <div
            className="flex min-h-[220px] items-center justify-center p-8"
            style={{ background: config?.accent ?? 'linear-gradient(135deg, #f0ebf7 0%, #ffffff 100%)' }}
          >
            {config?.image && <img src={config.image} alt={config.name} className="h-40 w-40 object-contain md:h-48 md:w-48" />}
          </div>
        </div>
      </section>

      <section className="scroll-x flex gap-3 pb-2">
        {categories.map(category => {
          const item = getGroceryCategoryConfig(category.slug)
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`rounded-full border px-4 py-2 text-sm font-bold ${
                slug === category.slug
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--stroke)] bg-white text-[var(--text-muted)] hover:text-[var(--primary)]'
              }`}
            >
              {item?.shortName ?? category.name}
            </Link>
          )
        })}
      </section>

      <div className="flex gap-6">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="surface-card sticky top-44 rounded-[28px] p-5">
            <h2 className="text-lg font-black tracking-[-0.04em] text-[var(--text)]">Filters</h2>
            <div className="mt-5 space-y-5">
              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={morningOnly}
                  onChange={event => setMorningOnly(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Morning slot available
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={event => setInStockOnly(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                In stock only
              </label>
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
                  <span>Max price</span>
                  <span>{formatPrice(priceMax)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxSliderValue}
                  value={priceMax}
                  onChange={event => setPriceMax(Number(event.target.value))}
                  className="mt-4 w-full accent-[var(--accent)]"
                />
              </div>
              <button onClick={resetFilters} className="text-sm font-bold text-[var(--accent)]">
                Clear filters
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--text)] md:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text-muted)]">Sort by</span>
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value)}
                className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--text)] outline-none"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="surface-card mb-4 rounded-[28px] p-5 md:hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black tracking-[-0.04em] text-[var(--text)]">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="rounded-xl border border-[var(--stroke)] p-2">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
                  <input
                    type="checkbox"
                    checked={morningOnly}
                    onChange={event => setMorningOnly(event.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Morning slot available
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={event => setInStockOnly(event.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  In stock only
                </label>
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
                    <span>Max price</span>
                    <span>{formatPrice(priceMax)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxSliderValue}
                    value={priceMax}
                    onChange={event => setPriceMax(Number(event.target.value))}
                    className="mt-4 w-full accent-[var(--accent)]"
                  />
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid-products">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton h-72 rounded-[24px]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="surface-card rounded-[30px] p-10 text-center">
              <h3 className="text-xl font-black tracking-[-0.04em] text-[var(--text)]">No products found</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Try adjusting your price range or removing one of the filters.</p>
            </div>
          ) : (
            <div className="grid-products">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
