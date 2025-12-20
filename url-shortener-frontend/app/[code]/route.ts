import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:1234'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  // Skip if it looks like a Next.js route or static file
  if (code.startsWith('_next') || code.startsWith('api') || code.includes('.')) {
    return new Response('Not Found', { status: 404 })
  }

  try {
    // Call backend to get original URL
    const response = await fetch(`${API_BASE_URL}/api/urls/${code}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      return new Response('Short URL not found', { status: 404 })
    }

    const data = await response.json()
    
    // Redirect to original URL using NextResponse
    return NextResponse.redirect(data.original_url, { status: 307 })
  } catch (error) {
    console.error('Redirect error:', error)
    return new Response('Failed to redirect', { status: 500 })
  }
}
