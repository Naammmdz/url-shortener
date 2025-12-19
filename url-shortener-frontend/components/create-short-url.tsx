"use client"

import type React from "react"
import { useState } from "react"
import { Button, Input, Card, CardBody, CardHeader, Snippet } from "@heroui/react"
import { ExternalLink, Sparkles } from "lucide-react"
import type { Link } from "@/types/link"

interface CreateShortUrlProps {
  onLinkCreated: (link: Link) => void
}

export function CreateShortUrl({ onLinkCreated }: CreateShortUrlProps) {
  const [longUrl, setLongUrl] = useState("")
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShortUrl(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: longUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to create short URL")
      }

      const data = await response.json()
      const fullShortUrl = `${apiBaseUrl}/${data.code}`
      setShortUrl(fullShortUrl)
      onLinkCreated(data)
      setLongUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-border/50 bg-card shadow-lg">
      <CardHeader className="flex-col items-start gap-2 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Create Short Link</h3>
        </div>
        <p className="text-sm text-muted-foreground">Paste your long URL below and get a shortened link instantly</p>
      </CardHeader>
      <CardBody className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Input
              type="url"
              placeholder="https://example.com/your/very/long/url/goes/here"
              value={longUrl}
              onValueChange={setLongUrl}
              isRequired
              isDisabled={loading}
              size="lg"
              classNames={{
                inputWrapper: "bg-background border border-border/50 hover:border-primary/50",
              }}
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              isDisabled={!longUrl}
              size="lg"
              className="w-full font-semibold"
            >
              {loading ? "Creating..." : "Shorten URL"}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          )}

          {shortUrl && (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <p className="text-sm font-medium text-foreground">Your short link is ready!</p>
              </div>
              <div className="flex gap-2">
                <Snippet
                  symbol=""
                  color="primary"
                  variant="bordered"
                  className="flex-1 font-mono text-sm"
                  classNames={{
                    base: "bg-background/50",
                  }}
                >
                  {shortUrl}
                </Snippet>
                <Button
                  isIconOnly
                  variant="flat"
                  color="primary"
                  onPress={() => window.open(shortUrl, "_blank")}
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardBody>
    </Card>
  )
}
