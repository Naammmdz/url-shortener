"use client"

import type React from "react"

import { useState } from "react"
import { Button, Input, Card, CardBody } from "@heroui/react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { ArrowLeft, Mail, Lock, User } from "lucide-react"

export function RegisterForm() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      await register({ email, password, name: name || undefined })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
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
          <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
          <p className="text-muted-foreground">Get started with URL Shortener</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Name"
            labelPlacement="outside"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            startContent={<User className="h-4 w-4 text-muted-foreground" />}
            classNames={{
              label: "text-foreground font-medium pb-1",
              inputWrapper: "bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors",
            }}
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<Lock className="h-4 w-4 text-muted-foreground" />}
            classNames={{
              label: "text-foreground font-medium pb-1",
              inputWrapper: "bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors",
            }}
            isRequired
          />

          <Input
            type="password"
            label="Confirm Password"
            labelPlacement="outside"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            startContent={<Lock className="h-4 w-4 text-muted-foreground" />}
            classNames={{
              label: "text-foreground font-medium pb-1",
              inputWrapper: "bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors",
            }}
            isRequired
          />

          {error && <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}

          <Button type="submit" color="primary" className="w-full font-medium" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
