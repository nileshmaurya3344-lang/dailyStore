export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  phone?: string
  full_name?: string
  email?: string
  role: UserRole
  wallet_balance: number
  referral_code?: string
  referred_by?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  image_url?: string
  description?: string
  sort_order: number
  is_active: boolean
}

export interface Product {
  id: string
  name: string
  category_id: string
  category?: Category
  price: number
  mrp: number
  image_url?: string
  description?: string
  brand?: string
  weight_unit?: string
  weight_value?: number
  stock: number
  is_morning_delivery_available: boolean
  is_active: boolean
  tags: string[]
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  product?: Product
  quantity: number
}

export interface Address {
  id: string
  user_id: string
  label: string
  full_name: string
  phone: string
  address_line: string
  landmark?: string
  city: string
  pincode: string
  is_default: boolean
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type DeliveryType = 'instant' | 'morning'
export type PaymentMethod = 'cod' | 'upi' | 'wallet'

export interface Order {
  id: string
  order_number: string
  user_id: string
  address_id?: string
  address?: Address
  status: OrderStatus
  delivery_type: DeliveryType
  delivery_date?: string
  subtotal: number
  discount: number
  coupon_code?: string
  delivery_charge: number
  total_price: number
  payment_method: PaymentMethod
  payment_status: string
  notes?: string
  order_items?: OrderItem[]
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product?: Product
  product_name: string
  product_image?: string
  quantity: number
  price: number
  mrp: number
}

export type SubscriptionFrequency = 'daily' | 'alternate' | 'custom'

export interface Subscription {
  id: string
  user_id: string
  product_id: string
  product?: Product
  address_id?: string
  frequency: SubscriptionFrequency
  custom_days?: number[]
  delivery_time: string
  quantity: number
  start_date: string
  end_date?: string
  is_active: boolean
  is_paused: boolean
  pause_until?: string
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: 'percentage' | 'flat'
  discount_value: number
  min_order: number
  max_discount?: number
  max_uses?: number
  used_count: number
  is_active: boolean
  expires_at?: string
}

// Cart store types
export interface LocalCartItem {
  product: Product
  quantity: number
}
