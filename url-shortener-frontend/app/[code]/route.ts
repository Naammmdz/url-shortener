import { NextResponse } from 'next/server'

// In production: API_BASE_URL is set to backend container URL
// In development: defaults to localhost:1234
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
    // Call backend redirect endpoint (which counts clicks automatically)
    const response = await fetch(`${API_BASE_URL}/${code}`, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects automatically
    })

    // Backend returns 301 redirect with Location header
    if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
      const location = response.headers.get('location')
      if (location) {
        return NextResponse.redirect(location, { status: 307 })
      }
    }

    return new Response('Short URL not found', { status: 404 })
  } catch (error) {
    console.error('Redirect error:', error)
    return new Response('Failed to redirect', { status: 500 })
  }
}
