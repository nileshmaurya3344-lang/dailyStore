'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock3, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { supabase } from '@/lib/supabaseClient'
import { Category, Product } from '@/lib/types'
import { filterGroceryCategories, filterGroceryProducts, GROCERY_CATEGORY_CONFIG } from '@/lib/grocery'
import { formatDiscount } from '@/lib/utils'

function HeroSection() {
  return (
    <section className="mt-[-12px] w-full">
      <div className="relative overflow-hidden rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
        <img 
          src="/banner-mart.png" 
          alt="Vinay Nagar Mart Banner" 
          className="w-full h-auto object-cover"
        />
      </div>
    </section>
  )
}

function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <section className="page-section mt-12 md:mt-24">
      <div className="section-header mb-8 md:mb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--primary)]/20"></span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]/70">Aisles</p>
          </div>
          <h2 className="text-3xl font-black tracking-[-0.05em] text-[var(--text)] md:text-5xl">
            Shop by grocery aisle
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map(category => {
          const config = GROCERY_CATEGORY_CONFIG.find(item => item.slug === category.slug)
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative flex flex-col items-center"
            >
              <div
                className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[32px] p-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                style={{
                  background: config?.accent ?? 'linear-gradient(135deg, #f8f6fb 0%, #ffffff 100%)',
                }}
              >
                {/* Subtle background glow */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
                
                {config?.image ? (
                  <img
                    src={config.image}
                    alt={category.name}
                    className="z-10 h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.08))' }}
                  />
                ) : (
                  <span className="z-10 text-lg font-black text-[var(--primary)]/30">{category.name[0]}</span>
                )}
              </div>
              
              <div className="mt-5 w-full text-center">
                <h3 className="text-base font-black leading-tight text-[var(--text)] transition-colors group-hover:text-[var(--primary)] md:text-lg">
                  {config?.name ?? category.name}
                </h3>
                <div className="mx-auto mt-2 h-1 w-0 bg-[var(--accent)] transition-all duration-300 group-hover:w-8" />
                <p className="mt-3 text-[11px] font-bold leading-relaxed text-[var(--text-muted)] opacity-60 line-clamp-2 md:text-xs">
                  {config?.description ?? 'Everyday essentials'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function ProductShelf({
  title,
  description,
  href,
  products,
}: {
  title: string
  description: string
  href: string
  products: Product[]
}) {
  if (products.length === 0) return null

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">{description}</p>
          <h2 className="section-title mt-1 text-[var(--text)]">{title}</h2>
        </div>
        <Link href={href} className="section-link">
          View all
        </Link>
      </div>
      <div className="scroll-x -mx-5 flex gap-5 px-5 pb-6 md:-mx-8 md:px-8">
        {products.map(product => (
          <div key={product.id} className="w-[200px] shrink-0 md:w-[240px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [categoryResponse, productResponse] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
      ])

      if (categoryResponse.data) {
        setCategories(filterGroceryCategories(categoryResponse.data))
      }

      if (productResponse.data) {
        setProducts(filterGroceryProducts(productResponse.data as Product[]))
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const freshProducts = products.filter(product => product.category?.slug === 'fruits-vegetables').slice(0, 10)
  const staplesProducts = products
    .filter(product => ['atta-rice-dals', 'masala-oil-ghee'].includes(product.category?.slug ?? ''))
    .slice(0, 10)
  const dairyProducts = products.filter(product => ['dairy', 'breakfast'].includes(product.category?.slug ?? '')).slice(0, 10)
  const snackProducts = products.filter(product => product.category?.slug === 'snacks').slice(0, 10)
  const beverageProducts = products.filter(product => product.category?.slug === 'beverages').slice(0, 10)
  const bestDeals = [...products].sort((first, second) => formatDiscount(second.price, second.mrp) - formatDiscount(first.price, first.mrp)).slice(0, 10)

  return (
    <div className="container-app pb-12">
      <HeroSection />

      {categories.length > 0 && <CategoryStrip categories={categories} />}

      {loading ? (
        <section className="grid-products">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="skeleton h-72 rounded-[24px]" />
          ))}
        </section>
      ) : (
        <>
          <ProductShelf
            title="Best grocery deals"
            description="Top offers"
            href="/category/atta-rice-dals"
            products={bestDeals}
          />
          <ProductShelf
            title="Fresh fruits and vegetables"
            description="Picked for today"
            href="/category/fruits-vegetables"
            products={freshProducts}
          />
          <ProductShelf
            title="Staples for the week"
            description="Atta, rice, dals, oil and masala"
            href="/category/atta-rice-dals"
            products={staplesProducts}
          />
          <ProductShelf
            title="Dairy and breakfast"
            description="Morning essentials"
            href="/category/dairy"
            products={dairyProducts}
          />
          <ProductShelf
            title="Munchies and beverages"
            description="Snacks for every craving"
            href="/category/snacks"
            products={[...snackProducts, ...beverageProducts].slice(0, 10)}
          />

          {products.length > 0 && (
            <section className="page-section">
              <div className="section-header">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Catalogue</p>
                  <h2 className="section-title mt-1 text-[var(--text)]">Explore all groceries</h2>
                </div>
              </div>
              <div className="grid-products">
                {products.slice(0, 20).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
