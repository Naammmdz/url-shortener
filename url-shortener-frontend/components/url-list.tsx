"use client"

import { LinkDetail } from "@/components/link-detail"
import { useAuth } from "@/contexts/auth-context"
import { getCookie } from "@/lib/cookies"
import { getAnonymousId } from "@/lib/storage"
import { showErrorToast } from "@/lib/toast-helpers"
import type { Link } from "@/types/link"
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/react"
import { BarChart3, Check, Copy, ExternalLink, Eye } from "lucide-react"
import { useEffect, useState } from "react"

interface UrlListProps {
  refreshTrigger: number
}

export function UrlList({ refreshTrigger }: UrlListProps) {
  const { user } = useAuth()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Use empty string to go through Next.js proxy
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

  useEffect(() => {
    fetchLinks()
  }, [refreshTrigger, user])

  const fetchLinks = async () => {
    setLoading(true)

    try {
      // Get JWT token or anonymous_id
      const accessToken = getCookie("access_token")
      const anonymousId = getAnonymousId()

      // If no authentication and no anonymous_id, clear links
      if (!accessToken && !anonymousId) {
        setLinks([])
        setLoading(false)
        return
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Add Authorization header if user is logged in
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      // Build query params for anonymous users
      let url = `${apiBaseUrl}/api/urls`
      if (!accessToken && anonymousId) {
        url += `?anonymous_id=${anonymousId}`
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error("Failed to fetch links")
      }

      const data = await response.json()
      // Backend returns: { total: number, urls: Array }
      const linksData = data.urls || []
      
      // Get frontend URL for short URLs
      const frontendUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      // Transform backend data to frontend Link type
      const transformedLinks: Link[] = linksData.map((item: any) => ({
        id: item.id,
        code: item.short_code,
        url: item.original_url,
        shortUrl: `${frontendUrl}/${item.short_code}`,
        clicks: item.clicks || 0,
        createdAt: item.created_at,
      }))
      
      setLinks(transformedLinks)
    } catch (err) {
      showErrorToast(err)
      setLinks([]) // Clear links on error
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (code: string) => {
    const frontendUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const shortUrl = `${frontendUrl}/${code}`
    await navigator.clipboard.writeText(shortUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <Card className="border border-border/50 bg-card">
        <CardBody className="flex items-center justify-center py-16">
          <Spinner size="lg" color="primary" label="Loading your links..." />
        </CardBody>
      </Card>
    )
  }

  if (links.length === 0) {
    return (
      <Card className="border border-border/50 bg-card">
        <CardBody className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">No links yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first short URL above to get started</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card className="border border-border/50 bg-card shadow-lg">
        <CardHeader className="flex-col items-start gap-2">
          <h3 className="text-xl font-semibold">Your Links</h3>
          <p className="text-sm text-muted-foreground">
            {links.length} {links.length === 1 ? "link" : "links"} created
          </p>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            aria-label="Shortened URLs table"
            removeWrapper
            classNames={{
              th: "bg-muted/50 text-muted-foreground font-semibold text-xs uppercase tracking-wider",
              td: "text-sm",
            }}
          >
            <TableHeader>
              <TableColumn>Short Code</TableColumn>
              <TableColumn>Original URL</TableColumn>
              <TableColumn align="center">Clicks</TableColumn>
              <TableColumn>Created</TableColumn>
              <TableColumn align="end">Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.code} className="hover:bg-muted/30">
                  <TableCell>
                    <Chip
                      color="primary"
                      variant="flat"
                      size="sm"
                      classNames={{
                        content: "font-mono text-xs font-semibold",
                      }}
                    >
                      {link.code}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md truncate text-muted-foreground">{link.url}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Chip variant="flat" size="sm" className="bg-background">
                        {link.clicks || 0}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{formatDate(link.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => setSelectedLink(link)}
                        aria-label="View details"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => handleCopy(link.code)}
                        aria-label="Copy short URL"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        {copiedCode === link.code ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => window.open(link.shortUrl, "_blank")}
                        aria-label="Open short URL"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {selectedLink && <LinkDetail link={selectedLink} apiBaseUrl={apiBaseUrl} onClose={() => setSelectedLink(null)} />}
    </>
  )
}
