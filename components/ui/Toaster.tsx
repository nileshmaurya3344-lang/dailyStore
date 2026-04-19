'use client'

import { useEffect, useState } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let toastIdCounter = 0
const subscribers: ((toasts: Toast[]) => void)[] = []
let currentToasts: Toast[] = []

export function showToast(message: string, type: Toast['type'] = 'success') {
  const id = toastIdCounter++
  currentToasts = [...currentToasts, { id, message, type }]
  subscribers.forEach(fn => fn(currentToasts))
  setTimeout(() => {
    currentToasts = currentToasts.filter(t => t.id !== id)
    subscribers.forEach(fn => fn(currentToasts))
  }, 3000)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    subscribers.push(setToasts)
    return () => {
      const idx = subscribers.indexOf(setToasts)
      if (idx > -1) subscribers.splice(idx, 1)
    }
  }, [])

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="animate-slide-up flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
          style={{
            background: toast.type === 'success'
              ? 'var(--zepto-green)'
              : toast.type === 'error'
              ? 'var(--accent)'
              : 'var(--primary)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '16px',
          }}
        >
          {/* Icon placeholder or nothing for premium look */}
          {toast.message}
        </div>
      ))}
    </div>
  )
}
