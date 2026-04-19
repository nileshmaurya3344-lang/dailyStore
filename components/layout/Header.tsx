'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Search, MapPin, User, Menu, X, Clock3, ChevronRight, Sparkles } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { GROCERY_CATEGORY_CONFIG } from '@/lib/grocery'

export function Header() {
  const { getTotalItems, openCart } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const totalItems = getTotalItems()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!searchQuery.trim()) return
    setMenuOpen(false)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const [locationName, setLocationName] = useState('Select Location')

  const handleLocation = () => {
    if ('geolocation' in navigator) {
      setLocationName('Detecting...')
      navigator.geolocation.getCurrentPosition(
        async position => {
          try {
            // In a real app, we would reverse geocode here. 
            // For now, we'll simulate a successful detection.
            setLocationName('Vinay Nagar, FBD')
          } catch (error) {
            setLocationName('Faridabad')
          }
        },
        () => {
          setLocationName('Faridabad')
        }
      )
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col shadow-sm transition-all duration-300">
      {/* Top Banner - Subtle & Clean */}
      <div className="bg-[#f2f2f2] py-1.5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Delivery in <span className="text-[#5b168f]">12-15 mins</span> • Vinay Nagar, Faridabad
        </p>
      </div>

      {/* Main Header - Premium Vinay Nagar Mart Style */}
      <div className={`relative z-10 bg-white transition-all duration-300 ${scrolled ? 'py-1 shadow-md' : 'py-3 border-b border-slate-100'}`}>
        <div className="container-app">
          <div className="flex items-center gap-4 lg:gap-10">
            {/* Logo & Location Group */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center group shrink-0">
                <div className="flex items-baseline text-[22px] font-black tracking-tighter">
                  <span className="text-[#5b168f]">Vinay</span>
                  <span className="ml-3 text-[#5b168f]">Nagar</span>
                  <span className="ml-3 text-[#ff2b85]">Mart</span>
                </div>
              </Link>

              <button 
                onClick={handleLocation}
                className="hidden lg:flex items-center gap-2 group border-l border-slate-100 pl-8"
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#5b168f]" />
                    <span className="text-[13px] font-bold text-slate-700">{locationName}</span>
                    <ChevronRight size={14} className="rotate-90 text-slate-400 group-hover:text-[#5b168f] transition-colors" />
                  </div>
                </div>
              </button>
            </div>

            {/* Search Architecture - Clean & High Contrast */}
            <form onSubmit={handleSearch} className="flex-1 max-w-5xl">
              <div className="group relative flex items-center">
                <input
                  type="text"
                  className="h-11 w-full rounded-l-xl bg-slate-50 border-2 border-slate-100 pl-6 pr-4 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 outline-none ring-offset-0 transition-all focus:bg-white focus:border-[#5b168f]/20 focus:shadow-[0_0_0_4px_rgba(91,22,143,0.05)]"
                  placeholder='Search for "milk", "atta", "fruits"...'
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                />
                <button 
                  type="submit" 
                  className="h-11 px-10 rounded-r-xl bg-[#3ab54a] text-white text-[13px] font-black uppercase tracking-wider hover:bg-[#2e9a3c] transition-all shadow-sm active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Action Hub - Icon + Label Style */}
            <div className="flex items-center gap-8">
              <Link
                href={user ? '/dashboard' : '/auth'}
                className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-[#5b168f] transition-colors"
              >
                <User size={22} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-wider">{user ? user.full_name?.split(' ')[0] : 'Login'}</span>
              </Link>

              <button
                onClick={openCart}
                className="relative flex flex-col items-center gap-0.5 text-slate-700 hover:text-[#5b168f] transition-colors"
              >
                <div className="relative">
                  <ShoppingCart size={22} strokeWidth={2.5} />
                  {totalItems > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff2b85] px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-white">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider">Cart</span>
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-all lg:hidden"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Navigation Strip - Hardware Pill Category List */}
          <nav className="mt-4 flex items-center gap-3 overflow-x-auto border-t border-slate-50 pt-4 pb-1 scroll-hide">
            {GROCERY_CATEGORY_CONFIG.map(item => {
              const active = pathname === `/category/${item.slug}`
              return (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-bold tracking-tight transition-all ${
                    active
                      ? 'bg-[#5b168f] text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#5b168f]'
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : 'bg-slate-300'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute inset-x-0 top-full bg-white p-4 shadow-xl lg:hidden border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-3">
              {GROCERY_CATEGORY_CONFIG.map(item => (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-xs font-bold text-slate-700 hover:bg-[#5b168f]/5"
                >
                  <div className="h-2 w-2 rounded-full bg-[#5b168f]/20" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
