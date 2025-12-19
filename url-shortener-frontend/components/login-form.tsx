"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Button, Card, CardBody, Input } from "@heroui/react"
import { ArrowLeft, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardBody className="space-y-6 p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="h-4 w-4 text-muted-foreground" />}
              classNames={{
                input: "text-sm bg-transparent",
                inputWrapper: "h-12 bg-background/50 border border-default-200 hover:border-default-300 rounded-lg transition-colors px-4 gap-3",
              }}
              isRequired
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock className="h-4 w-4 text-muted-foreground" />}
              classNames={{
                input: "text-sm bg-transparent",
                inputWrapper: "h-12 bg-background/50 border border-default-200 hover:border-default-300 rounded-lg transition-colors px-4 gap-3",
              }}
              isRequired
            />
          </div>

          {error && <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}

          <Button type="submit" color="primary" className="w-full font-medium" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
