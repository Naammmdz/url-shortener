"use client"

import { getCookie } from "@/lib/cookies"
import { getAnonymousId, setAnonymousId } from "@/lib/storage"
import { showErrorToast, showSuccessToast } from "@/lib/toast-helpers"
import type { Link } from "@/types/link"
import { Button, Card, CardBody, CardHeader, Input, Snippet } from "@heroui/react"
import { ExternalLink, Sparkles } from "lucide-react"
import type React from "react"
import { useState } from "react"

interface CreateShortUrlProps {
  onLinkCreated: (link: Link) => void
}

export function CreateShortUrl({ onLinkCreated }: CreateShortUrlProps) {
  const [longUrl, setLongUrl] = useState("")
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Use empty string to go through Next.js proxy
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShortUrl(null)

    try {
      // Get JWT token and anonymous_id
      const accessToken = getCookie("access_token")
      const anonymousId = getAnonymousId()

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Add Authorization header if user is logged in
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      const body: { url: string; anonymous_id?: string } = { url: longUrl }
      
      // Add anonymous_id if not logged in and exists
      if (!accessToken && anonymousId) {
        body.anonymous_id = anonymousId
      }

      const response = await fetch(`${apiBaseUrl}/api/shorten`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create short URL" }))
        throw new Error(errorData.error || "Failed to create short URL")
      }

      const data = await response.json()
      // Backend returns: { short_code, short_url, original_url, anonymous_id? }
      
      // Save anonymous_id if returned (for first-time anonymous users)
      if (data.anonymous_id) {
        setAnonymousId(data.anonymous_id)
      }

      // Build full short URL - use current origin if backend returns relative path
      let fullShortUrl = data.short_url
      if (fullShortUrl && !fullShortUrl.startsWith('http')) {
        fullShortUrl = `${window.location.origin}${fullShortUrl.startsWith('/') ? '' : '/'}${fullShortUrl}`
      }

      setShortUrl(fullShortUrl)
      onLinkCreated({
        id: data.short_code,
        code: data.short_code,
        url: data.original_url,
        shortUrl: fullShortUrl,
        clicks: 0,
        createdAt: new Date().toISOString(),
      })
      setLongUrl("")
      showSuccessToast("Short link created!", "Your link is ready to share.")
    } catch (err) {
      showErrorToast(err)
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
