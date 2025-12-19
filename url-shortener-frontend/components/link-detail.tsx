"use client"

import type { Link } from "@/types/link"
import { Button, Card, CardBody, Modal, ModalBody, ModalContent, ModalHeader, Snippet, Spinner } from "@heroui/react"
import { BarChart3, Calendar, Clock, Copy, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

interface LinkDetailProps {
  link: Link
  apiBaseUrl: string
  onClose: () => void
}

export function LinkDetail({ link, apiBaseUrl, onClose }: LinkDetailProps) {
  const [detailedLink, setDetailedLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLinkDetail()
  }, [link.code])

  const fetchLinkDetail = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/urls/${link.code}`)

      if (!response.ok) {
        throw new Error("Failed to fetch link details")
      }

      const data = await response.json()
      // Backend returns: { id, short_code, original_url, clicks, created_at, updated_at }
      setDetailedLink({
        id: data.id,
        code: data.short_code,
        url: data.original_url,
        shortUrl: `${apiBaseUrl}/${data.short_code}`,
        clicks: data.clicks || 0,
        createdAt: data.created_at,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="2xl" classNames={{ base: "bg-card" }}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-border/50">
          <h3 className="text-xl font-semibold">Link Analytics</h3>
          <p className="text-sm font-normal text-muted-foreground">Detailed information about your short link</p>
        </ModalHeader>
        <ModalBody className="py-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" color="primary" label="Loading details..." />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          )}

          {detailedLink && (
            <div className="space-y-6">
              <Card className="border border-primary/20 bg-primary/5">
                <CardBody className="gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total Clicks</span>
                  </div>
                  <p className="text-4xl font-bold text-primary">{detailedLink.clicks || 0}</p>
                </CardBody>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Short URL</label>
                  <div className="flex gap-2">
                    <Snippet
                      symbol=""
                      color="primary"
                      variant="bordered"
                      className="flex-1 font-mono text-sm"
                      classNames={{ base: "bg-background/50" }}
                    >
                      {`${apiBaseUrl}/${detailedLink.code}`}
                    </Snippet>
                    <Button
                      isIconOnly
                      variant="flat"
                      color="primary"
                      onPress={() => window.open(`${apiBaseUrl}/${detailedLink.code}`, "_blank")}
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Original URL</label>
                  <div className="flex gap-2">
                    <Card className="flex-1 border border-border/50">
                      <CardBody className="break-all px-3 py-2.5 text-sm text-muted-foreground">
                        {detailedLink.url}
                      </CardBody>
                    </Card>
                    <Button
                      isIconOnly
                      variant="flat"
                      onPress={() => handleCopy(detailedLink.url)}
                      aria-label="Copy original URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border border-border/50 bg-muted/30">
                  <CardBody className="gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Created</span>
                    </div>
                    <p className="text-sm font-medium">{formatDate(detailedLink.createdAt)}</p>
                  </CardBody>
                </Card>

                {detailedLink.lastAccessedAt && (
                  <Card className="border border-border/50 bg-muted/30">
                    <CardBody className="gap-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Last Accessed</span>
                      </div>
                      <p className="text-sm font-medium">{formatDate(detailedLink.lastAccessedAt)}</p>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
