"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { HeroUIProvider } from "@heroui/react"
import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </AuthProvider>
  )
}
