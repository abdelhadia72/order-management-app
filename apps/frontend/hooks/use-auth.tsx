"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { useAuthStore } from "@/lib/store/auth-store"

export function useAuth() {
  const store = useAuthStore()
  const [authChecked, setAuthChecked] = useState(false)
  const checkInProgress = useRef(false)

  const checkAuth = useCallback(() => {
    if (!authChecked && !checkInProgress.current) {
      checkInProgress.current = true
      return store.checkAuth().finally(() => {
        setAuthChecked(true)
        checkInProgress.current = false
      })
    }
    return Promise.resolve()
  }, [store, authChecked])

  const login = useCallback(
    (email: string, password: string) => {
      return store.login(email, password)
    },
    [store],
  )

  const register = useCallback(
    (name: string, email: string, password: string) => {
      return store.register(name, email, password)
    },
    [store],
  )

  const logout = useCallback(() => {
    store.logout()
  }, [store])

  useEffect(() => {
    if (!authChecked) {
      checkAuth()
    }
  }, [checkAuth, authChecked]);

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login,
    register,
    logout,
  }
}
