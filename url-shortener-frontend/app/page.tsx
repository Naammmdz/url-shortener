"use client"

import { useState } from "react"
import { CreateShortUrl } from "@/components/create-short-url"
import { UrlList } from "@/components/url-list"
import { UserMenu } from "@/components/user-menu"
import { Button } from "@heroui/react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Link2 } from "lucide-react"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user } = useAuth()

  const handleLinkCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">LinkShort</h1>
              </div>
            </div>
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-3">
                <Button as={Link} href="/login" variant="light" size="sm">
                  Sign In
                </Button>
                <Button as={Link} href="/register" color="primary" size="sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Shorten your links,
              <span className="text-primary"> amplify your reach</span>
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Create short, memorable links in seconds. No login required. Track clicks and manage your URLs with ease.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="space-y-8">
          <CreateShortUrl onLinkCreated={handleLinkCreated} />
          <UrlList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </main>
  )
}
