"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { RegisterForm } from "@/components/register-form"
import { Spinner } from "@heroui/react"

export default function RegisterPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </main>
    )
  }

  if (user) {
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <RegisterForm />
    </main>
  )
}
