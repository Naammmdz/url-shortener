"use client"

import { deleteCookie, getCookie, setCookie } from "@/lib/cookies"
import type { LoginCredentials, RegisterCredentials, User } from "@/types/auth"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Use empty string to go through Next.js proxy
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  claimAnonymousLinks: (token: string) => Promise<void>
  refreshAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing JWT session on mount from cookies
    const storedToken = getCookie("access_token")
    const storedUser = getCookie("auth_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(decodeURIComponent(storedUser)))
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Login failed" }))
      throw new Error(error.error || "Login failed")
    }

    const data = await response.json()
    // Backend returns: { id, username, email, access_token, refresh_token, message }
    const user: User = {
      id: data.id,
      username: data.username,
      email: data.email,
    }
    setUser(user)
    setToken(data.access_token)
    
    // Store in secure cookies
    setCookie("access_token", data.access_token, 1/96) // 15 minutes (1/96 of a day)
    setCookie("refresh_token", data.refresh_token, 7) // 7 days
    setCookie("auth_user", encodeURIComponent(JSON.stringify(user)), 7)

    // Automatically claim any anonymous links
    await claimAnonymousLinks(data.access_token)
  }

  const register = async (credentials: RegisterCredentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Registration failed" }))
      throw new Error(error.error || "Registration failed")
    }

    const data = await response.json()
    // Backend returns: { id, username, email, access_token, refresh_token, message }
    const user: User = {
      id: data.id,
      username: data.username,
      email: data.email,
    }
    setUser(user)
    setToken(data.access_token)
    
    // Store in secure cookies
    setCookie("access_token", data.access_token, 1/96) // 15 minutes (1/96 of a day)
    setCookie("refresh_token", data.refresh_token, 7) // 7 days
    setCookie("auth_user", encodeURIComponent(JSON.stringify(user)), 7)

    // Automatically claim any anonymous links
    await claimAnonymousLinks(data.access_token)
  }

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = getCookie("refresh_token")
    if (!refreshToken) {
      return null
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        // Refresh token expired or invalid, logout user
        logout()
        return null
      }

      const data = await response.json()
      // Backend returns: { access_token, refresh_token, message }
      
      // Update cookies with new tokens
      setCookie("access_token", data.access_token, 1/96) // 15 minutes
      setCookie("refresh_token", data.refresh_token, 7) // 7 days
      setToken(data.access_token)
      
      return data.access_token
    } catch (error) {
      console.error("Failed to refresh token:", error)
      logout()
      return null
    }
  }

  const claimAnonymousLinks = async (accessToken: string) => {
    const anonymousId = getCookie("anonymous_id")
    if (!anonymousId) {
      return // No anonymous links to claim
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/claim-links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ anonymous_id: anonymousId }),
      })

      if (response.ok) {
        // Successfully claimed, remove anonymous_id
        deleteCookie("anonymous_id")
      }
    } catch (error) {
      console.error("Failed to claim anonymous links:", error)
      // Don't throw error, claiming is optional
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    deleteCookie("access_token")
    deleteCookie("refresh_token")
    deleteCookie("auth_user")
    // Don't delete anonymous_id - user might want to create new anonymous links
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, claimAnonymousLinks, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
