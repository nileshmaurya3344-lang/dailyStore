'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUserStore } from '@/store/userStore'

export function useAuth() {
  const { user, setUser, clearUser, setLoading, isAdmin } = useUserStore()

  useEffect(() => {
    setLoading(true)

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (data) {
        setUser(data)
        return
      }

      clearUser()
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void fetchProfile(session.user.id)
      } else {
        clearUser()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void fetchProfile(session.user.id)
      } else {
        clearUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [clearUser, setLoading, setUser])

  async function signInWithEmail(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    clearUser()
  }

  return { user, isAdmin: isAdmin(), signInWithEmail, signOut }
}
