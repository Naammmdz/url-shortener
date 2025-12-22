import { NextRequest, NextResponse } from 'next/server'

// In production: API_BASE_URL is set to backend container URL
// In development: defaults to localhost:2345
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:2345'

async function proxyRequest(request: NextRequest, path: string) {
  // Build URL with query parameters
  const url = new URL(`${API_BASE_URL}/api/${path}`)
  // Copy all query parameters from original request
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value)
  })
  
  const headers = new Headers(request.headers)
  // Remove host header to avoid conflicts
  headers.delete('host')
  
  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? await request.text() 
        : undefined,
    })

    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 502 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path.join('/'))
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path.join('/'))
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path.join('/'))
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path.join('/'))
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path.join('/'))
}
