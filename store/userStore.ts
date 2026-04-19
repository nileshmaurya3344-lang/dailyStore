import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile } from '@/lib/types'

interface UserStore {
  user: Profile | null
  isLoading: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
  isAdmin: () => boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearUser: () => set({ user: null, isLoading: false }),
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'vnm-user',
    }
  )
)
