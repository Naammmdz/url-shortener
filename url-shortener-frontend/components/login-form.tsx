"use client"

import type React from "react"

import { useState } from "react"
import { Button, Input, Card, CardBody } from "@heroui/react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { ArrowLeft, Mail, Lock } from "lucide-react"

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
          <Input
            type="email"
            label="Email"
            labelPlacement="outside"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<Mail className="h-4 w-4 text-muted-foreground" />}
            classNames={{
              label: "text-foreground font-medium pb-1",
              inputWrapper: "bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors",
            }}
            isRequired
          />

          <Input
            type="password"
            label="Password"
            labelPlacement="outside"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<Lock className="h-4 w-4 text-muted-foreground" />}
            classNames={{
              label: "text-foreground font-medium pb-1",
              inputWrapper: "bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors",
            }}
            isRequired
          />

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
