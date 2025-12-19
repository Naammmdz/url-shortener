"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@heroui/react"
import { Copy, ExternalLink, Eye, BarChart3, Check } from "lucide-react"
import type { Link } from "@/types/link"
import { LinkDetail } from "@/components/link-detail"

interface UrlListProps {
  refreshTrigger: number
}

export function UrlList({ refreshTrigger }: UrlListProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

  useEffect(() => {
    fetchLinks()
  }, [refreshTrigger])

  const fetchLinks = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/links`)

      if (!response.ok) {
        throw new Error("Failed to fetch links")
      }

      const data = await response.json()
      setLinks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (code: string) => {
    const shortUrl = `${apiBaseUrl}/${code}`
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

  if (error) {
    return (
      <Card className="border border-border/50 bg-card">
        <CardBody className="space-y-4 py-8">
          <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          <Button onPress={fetchLinks} variant="flat" color="primary" size="sm">
            Try Again
          </Button>
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
                        onPress={() => window.open(`${apiBaseUrl}/${link.code}`, "_blank")}
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
