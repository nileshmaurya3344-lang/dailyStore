import Link from 'next/link'
import { GROCERY_CATEGORY_CONFIG } from '@/lib/grocery'

export function Footer() {
  return (
    <footer className="mt-20 pb-8">
      <div className="container-app">
        <div className="overflow-hidden rounded-[32px] border border-[var(--stroke)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(38,17,55,0.08)]">
          <div className="grid gap-10 px-6 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white">
                  V
                </div>
                <div>
                  <div className="text-lg font-extrabold tracking-[-0.04em] text-[var(--text)]">Vinay Nagar Mart</div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Grocery only</div>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-7 text-[var(--text-muted)]">
                A Zepto-inspired grocery shopping experience focused on fruits, vegetables, dairy, pantry staples,
                snacks, and drinks for everyday home delivery.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['10-20 min delivery', 'Morning slots', 'Local inventory'].map(item => (
                  <span
                    key={item}
                    className="rounded-full bg-[var(--surface-soft)] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--text)]">Categories</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                {GROCERY_CATEGORY_CONFIG.map(item => (
                  <li key={item.slug}>
                    <Link href={`/category/${item.slug}`} className="hover:text-[var(--primary)]">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--text)]">Quick links</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                {[
                  ['Search products', '/search'],
                  ['My cart', '/cart'],
                  ['Checkout', '/checkout'],
                  ['Account', '/dashboard'],
                  ['Admin', '/admin'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-[var(--primary)]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--text)]">Support</h4>
              <div className="space-y-3 text-sm text-[var(--text-muted)]">
                <p>Vinay Nagar, Madhya Pradesh</p>
                <p>support@vinaynagarmart.local</p>
                <p>+91 98765 43210</p>
                <p>Order before 10:00 PM for next-morning delivery by 7:00 AM.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--stroke)] px-6 py-5 md:px-10">
            <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
              <p>Vinay Nagar Mart. Grocery-first shopping experience.</p>
              <p>Built for a professional Zepto-style grocery flow.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
