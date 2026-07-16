import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginService, logout as logoutService, refreshToken } from '../services/auth'
import { AuthState, UserDto } from '../types/api'

const AuthContext = createContext<{
  user: UserDto | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setAccessToken: (token: string | null) => void
}>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  setAccessToken: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ isAuthenticated: false, loading: true, user: null })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshToken()
        setState({ isAuthenticated: true, loading: false, user: null })
      } catch {
        setState({ isAuthenticated: false, loading: false, user: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    await loginService({ email, password })
    setState({ isAuthenticated: true, loading: false, user: null })
  }

  const logout = async () => {
    await logoutService()
    setState({ isAuthenticated: false, loading: false, user: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
