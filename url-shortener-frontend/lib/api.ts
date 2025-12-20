import { getCookie, setCookie } from "./cookies"

// In production, use relative URL to go through Next.js proxy
// In development or when NEXT_PUBLIC_API_BASE_URL is set, use that URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

interface FetchWithAuthOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Fetch wrapper that automatically handles token refresh on 401 errors
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options

  // Add Authorization header if token exists and not skipped
  if (!skipAuth) {
    const accessToken = getCookie("access_token")
    if (accessToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  }

  // Make the initial request
  let response = await fetch(url, fetchOptions)

  // If 401 Unauthorized, try to refresh token and retry
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken()
    
    if (newToken) {
      // Retry with new token
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${newToken}`,
      }
      response = await fetch(url, fetchOptions)
    }
  }

  return response
}

/**
 * Refresh the access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getCookie("refresh_token")
  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      // Refresh token expired, clear all auth data
      return null
    }

    const data = await response.json()
    
    // Update cookies with new tokens
    setCookie("access_token", data.access_token, 1/96) // 15 minutes
    setCookie("refresh_token", data.refresh_token, 7) // 7 days
    
    return data.access_token
  } catch (error) {
    console.error("Failed to refresh token:", error)
    return null
  }
}
