'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Product } from '@/lib/types'
import { ProductCard } from '@/components/product/ProductCard'
import { filterGroceryProducts, GROCERY_CATEGORY_CONFIG } from '@/lib/grocery'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSearchResults() {
      if (!query) {
        setProducts([])
        return
      }

      setLoading(true)
      const response = await supabase.from('products').select('*, category:categories(*)').eq('is_active', true)
      const catalogue = filterGroceryProducts((response.data as Product[]) ?? [])
      const searchValue = query.toLowerCase()

      setProducts(
        catalogue.filter(product => {
          const tags = product.tags?.join(' ').toLowerCase() ?? ''
          const brand = product.brand?.toLowerCase() ?? ''
          return (
            product.name.toLowerCase().includes(searchValue) ||
            brand.includes(searchValue) ||
            tags.includes(searchValue) ||
            (product.category?.name?.toLowerCase() ?? '').includes(searchValue)
          )
        })
      )
      setLoading(false)
    }

    void loadSearchResults()
  }, [query])

  return (
    <div className="container-app space-y-6 pb-12">
      <section className="surface-card-strong rounded-[34px] p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
            <Search size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Search</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">
              {query ? `Results for "${query}"` : 'Search groceries'}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Browse across fruits, vegetables, dairy, staples, snacks, and beverages only.
            </p>
          </div>
        </div>
      </section>

      {!query && (
        <section className="surface-card rounded-[30px] p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Popular aisles</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {GROCERY_CATEGORY_CONFIG.map(category => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--text)] hover:text-[var(--primary)]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="grid-products">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton h-72 rounded-[24px]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <section className="surface-card rounded-[30px] p-10 text-center">
          <h2 className="text-xl font-black tracking-[-0.04em] text-[var(--text)]">
            {query ? 'No grocery products matched your search' : 'Start by searching a product'}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Try product names like milk, atta, curd, chips, rice, or juice.
          </p>
        </section>
      ) : (
        <section className="grid-products">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-app pb-12"><div className="skeleton h-40 rounded-[30px]" /></div>}>
      <SearchPageContent />
    </Suspense>
  )
}
