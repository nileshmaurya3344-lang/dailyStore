'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, MapPin, Plus, Truck } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { Address } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

type PaymentMethod = 'cod' | 'online'
type DeliveryType = 'instant' | 'morning'

function getDeliveryDateValue(deliveryType: DeliveryType) {
  const deliveryDate = new Date()
  deliveryDate.setHours(0, 0, 0, 0)
  deliveryDate.setDate(deliveryDate.getDate() + (deliveryType === 'morning' ? 1 : 0))
  return deliveryDate.toISOString().split('T')[0]
}

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('instant')
  const [placing, setPlacing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    landmark: '',
    pincode: '462001',
  })

  const subtotal = getTotalPrice()
  const deliveryCharge = subtotal >= 199 ? 0 : deliveryType === 'instant' ? 39 : 20
  const total = subtotal + deliveryCharge

  useEffect(() => {
    const currentUser = user
    if (!currentUser) return
    const userId = currentUser.id

    async function loadAddresses() {
      const response = await supabase.from('addresses').select('*').eq('user_id', userId)
      if (!response.data) return
      setAddresses(response.data)
      const defaultAddress = response.data.find(address => address.is_default) || response.data[0]
      if (defaultAddress) setSelectedAddress(defaultAddress)
    }

    void loadAddresses()
  }, [user])

  const addNewAddress = async () => {
    const currentUser = user

    if (!currentUser) {
      router.push('/auth')
      return
    }

    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line) {
      alert('Please fill the required address fields.')
      return
    }

    const response = await supabase
      .from('addresses')
      .insert({
        user_id: currentUser.id,
        label: 'Home',
        ...newAddress,
        city: 'Vinay Nagar',
        is_default: addresses.length === 0,
      })
      .select()
      .single()

    if (response.data) {
      setAddresses(current => [...current, response.data])
      setSelectedAddress(response.data)
      setShowAddAddress(false)
    }
  }

  const saveOrderToDatabase = async (method: string, paymentStatus: string) => {
    const currentUser = user
    if (!currentUser || !selectedAddress) return

    try {
      const orderResponse = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          address_id: selectedAddress.id,
          status: 'pending',
          delivery_type: deliveryType,
          delivery_date: getDeliveryDateValue(deliveryType),
          subtotal,
          discount: 0,
          delivery_charge: deliveryCharge,
          total_price: total,
          payment_method: method,
          payment_status: paymentStatus,
        })
        .select()
        .single()

      if (!orderResponse.data) throw new Error('Order could not be created')

      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: orderResponse.data.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.image_url,
          quantity: item.quantity,
          price: item.product.price,
          mrp: item.product.mrp,
        }))
      )

      setOrderNumber(orderResponse.data.order_number)
      clearCart()
      setSuccess(true)
    } catch (error) {
      console.error(error)
      alert('Unable to place the order right now.')
    }

    setPlacing(false)
  }

  const handleRazorpayPayment = async () => {
    setPlacing(true)

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })
      const orderData = await response.json()

      if (!response.ok) throw new Error(orderData.error)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vinay Nagar Mart',
        description: 'Grocery Order',
        order_id: orderData.id,
        handler: async (paymentResponse: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          const verificationResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentResponse),
          })
          const verificationData = await verificationResponse.json()

          if (verificationData.success) {
            await saveOrderToDatabase('online', 'paid')
          } else {
            alert('Payment verification failed.')
            setPlacing(false)
          }
        },
        prefill: {
          name: user?.full_name || selectedAddress?.full_name || '',
          email: user?.email || '',
          contact: selectedAddress?.phone,
        },
        theme: {
          color: '#5b168f',
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      }

      const razorpayWindow = window as typeof window & { Razorpay: RazorpayConstructor }
      const razorpay = new razorpayWindow.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error(error)
      alert('Unable to initialize online payment.')
      setPlacing(false)
    }
  }

  const placeOrder = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!selectedAddress) {
      alert('Please select a delivery address.')
      return
    }

    if (items.length === 0) return

    if (paymentMethod === 'online') {
      await handleRazorpayPayment()
      return
    }

    setPlacing(true)
    await saveOrderToDatabase('cod', 'pending')
  }

  if (success) {
    return (
      <div className="container-app pb-12">
        <div className="surface-card rounded-[34px] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
            <Check size={36} />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">Order placed successfully</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Order #{orderNumber}</p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            {deliveryType === 'morning' ? 'Your morning slot is booked.' : 'Your instant order is being prepared.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="btn-primary">
              Track order
            </Link>
            <Link href="/" className="btn-outline">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-app pb-12">
        <div className="surface-card rounded-[32px] p-10 text-center">
          <h1 className="text-3xl font-black tracking-[-0.05em] text-[var(--text)]">No items in checkout</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Add grocery products to continue.</p>
          <Link href="/" className="btn-primary mt-6">
            Browse groceries
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app space-y-6 pb-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <section className="surface-card-strong rounded-[34px] p-6 md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--primary)]/60">Checkout</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[var(--text)]">Finish your grocery order</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Address, delivery slot, payment, and live order total are all working here.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-4">
          {!user && (
            <div className="surface-card rounded-[30px] p-5">
              <p className="text-sm font-semibold text-[var(--text)]">
                Sign in to save addresses, place the order, and track it in your dashboard.
              </p>
              <Link href="/auth" className="btn-primary mt-4">
                Sign in
              </Link>
            </div>
          )}

          <section className="surface-card rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[var(--text)]">
                <MapPin size={18} />
                <h2 className="text-lg font-black tracking-[-0.04em]">Delivery address</h2>
              </div>
              <button onClick={() => setShowAddAddress(!showAddAddress)} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                <Plus size={16} />
                Add new
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {addresses.map(address => (
                <button
                  key={address.id}
                  onClick={() => setSelectedAddress(address)}
                  className={`w-full rounded-[24px] border p-4 text-left ${
                    selectedAddress?.id === address.id
                      ? 'border-[var(--primary)] bg-[var(--surface-soft)]'
                      : 'border-[var(--stroke)] bg-white'
                  }`}
                >
                  <p className="font-black text-[var(--text)]">{address.full_name}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {address.address_line}, {address.city} - {address.pincode}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{address.phone}</p>
                </button>
              ))}
            </div>

            {(showAddAddress || addresses.length === 0) && (
              <div className="mt-4 grid gap-3 rounded-[24px] border border-[var(--stroke)] bg-[var(--surface-soft)] p-4">
                <input
                  type="text"
                  placeholder="Full name"
                  value={newAddress.full_name}
                  onChange={event => setNewAddress(current => ({ ...current, full_name: event.target.value }))}
                  className="h-12 rounded-2xl border border-[var(--stroke)] bg-white px-4 text-sm font-semibold outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone number"
                  value={newAddress.phone}
                  onChange={event => setNewAddress(current => ({ ...current, phone: event.target.value }))}
                  className="h-12 rounded-2xl border border-[var(--stroke)] bg-white px-4 text-sm font-semibold outline-none"
                />
                <input
                  type="text"
                  placeholder="House, flat, street"
                  value={newAddress.address_line}
                  onChange={event => setNewAddress(current => ({ ...current, address_line: event.target.value }))}
                  className="h-12 rounded-2xl border border-[var(--stroke)] bg-white px-4 text-sm font-semibold outline-none"
                />
                <input
                  type="text"
                  placeholder="Landmark"
                  value={newAddress.landmark}
                  onChange={event => setNewAddress(current => ({ ...current, landmark: event.target.value }))}
                  className="h-12 rounded-2xl border border-[var(--stroke)] bg-white px-4 text-sm font-semibold outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={event => setNewAddress(current => ({ ...current, pincode: event.target.value }))}
                  className="h-12 rounded-2xl border border-[var(--stroke)] bg-white px-4 text-sm font-semibold outline-none"
                />
                <button onClick={addNewAddress} className="btn-primary justify-center">
                  Save address
                </button>
              </div>
            )}
          </section>

          <section className="surface-card rounded-[30px] p-5">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <Truck size={18} />
              <h2 className="text-lg font-black tracking-[-0.04em]">Delivery slot</h2>
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
                <p className="mt-1 text-sm text-[var(--text-muted)]">10-20 mins</p>
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
                <p className="mt-1 text-sm text-[var(--text-muted)]">By 7:00 AM tomorrow</p>
              </button>
            </div>
          </section>

          <section className="surface-card rounded-[30px] p-5">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <CreditCard size={18} />
              <h2 className="text-lg font-black tracking-[-0.04em]">Payment method</h2>
            </div>
            <div className="mt-4 space-y-3">
              <label className={`flex cursor-pointer items-center gap-3 rounded-[24px] border p-4 ${paymentMethod === 'cod' ? 'border-[var(--primary)] bg-[var(--surface-soft)]' : 'border-[var(--stroke)] bg-white'}`}>
                <input
                  type="radio"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <div>
                  <p className="font-bold text-[var(--text)]">Cash on delivery</p>
                  <p className="text-sm text-[var(--text-muted)]">Pay when the order reaches you</p>
                </div>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-[24px] border p-4 ${paymentMethod === 'online' ? 'border-[var(--primary)] bg-[var(--surface-soft)]' : 'border-[var(--stroke)] bg-white'}`}>
                <input
                  type="radio"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <div>
                  <p className="font-bold text-[var(--text)]">Online payment</p>
                  <p className="text-sm text-[var(--text-muted)]">UPI, cards, or netbanking via Razorpay</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside>
          <div className="surface-card sticky top-44 rounded-[30px] p-5">
            <h2 className="text-lg font-black tracking-[-0.04em] text-[var(--text)]">Order summary</h2>
            <div className="mt-5 space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold text-[var(--text)]">{item.product.name}</p>
                    <p className="text-[var(--text-muted)]">Qty {item.quantity}</p>
                  </div>
                  <span className="font-bold text-[var(--text)]">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3 border-t border-[var(--stroke)] pt-4 text-sm">
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
              <div className="flex justify-between text-base font-black text-[var(--text)]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={placeOrder} disabled={placing} className="btn-primary mt-5 flex w-full justify-center py-3">
              {placing ? 'Processing...' : `Place order - ${formatPrice(total)}`}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
