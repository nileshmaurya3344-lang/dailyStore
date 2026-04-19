import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDiscount(price: number, mrp: number): number {
  if (!mrp || mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

export function formatWeight(value?: number, unit?: string): string {
  if (!value || !unit) return ''
  if (unit === 'pcs') return `${value} pcs`
  if (value >= 1000 && unit === 'g') return `${value / 1000} kg`
  if (value >= 1000 && unit === 'ml') return `${value / 1000} L`
  return `${value} ${unit}`
}

export function getDeliveryDate(type: 'instant' | 'morning'): string {
  if (type === 'instant') {
    return 'Today in 10-20 mins'
  }

  const now = new Date()
  const deliveryDate = new Date(now)
  deliveryDate.setDate(deliveryDate.getHours() >= 22 ? now.getDate() + 2 : now.getDate() + 1)

  return `${deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })} by 7:00 AM`
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-yellow-700 bg-yellow-50',
    confirmed: 'text-blue-700 bg-blue-50',
    packed: 'text-purple-700 bg-purple-50',
    out_for_delivery: 'text-orange-700 bg-orange-50',
    delivered: 'text-green-700 bg-green-50',
    cancelled: 'text-red-700 bg-red-50',
  }
  return map[status] || 'text-gray-700 bg-gray-50'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Order Placed',
    confirmed: 'Confirmed',
    packed: 'Packed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return map[status] || status
}
