/**
 * Transform backend error messages into user-friendly messages
 */
export function transformError(error: unknown): string {
  if (typeof error === 'string') {
    return transformErrorMessage(error)
  }

  if (error instanceof Error) {
    return transformErrorMessage(error.message)
  }

  return 'An unexpected error occurred. Please try again.'
}

function transformErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Authentication errors
  if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }

  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('not authenticated')) {
    return 'You need to be logged in to perform this action.'
  }

  if (lowerMessage.includes('token expired') || lowerMessage.includes('token invalid')) {
    return 'Your session has expired. Please log in again.'
  }

  // Database constraint errors
  if (lowerMessage.includes('unique constraint failed: users.email')) {
    return 'This email is already registered. Please use a different email or log in.'
  }

  if (lowerMessage.includes('unique constraint failed: users.username')) {
    return 'This username is already taken. Please choose a different username.'
  }

  if (lowerMessage.includes('unique constraint') || lowerMessage.includes('duplicate')) {
    return 'This value is already in use. Please try a different one.'
  }

  // URL shortener specific errors
  if (lowerMessage.includes('short code already exists') || lowerMessage.includes('short code is taken')) {
    return 'This short URL is already taken. Please try a different one.'
  }

  if (lowerMessage.includes('url not found') || lowerMessage.includes('short url not found')) {
    return 'This short URL does not exist or may have been deleted.'
  }

  if (lowerMessage.includes('invalid url')) {
    return 'Please enter a valid URL (e.g., https://example.com).'
  }

  // Validation errors
  if (lowerMessage.includes('password') && lowerMessage.includes('too short')) {
    return 'Password must be at least 6 characters long.'
  }

  if (lowerMessage.includes('invalid email')) {
    return 'Please enter a valid email address.'
  }

  if (lowerMessage.includes('required') || lowerMessage.includes('cannot be empty')) {
    return 'Please fill in all required fields.'
  }

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch failed')) {
    return 'Network error. Please check your internet connection and try again.'
  }

  if (lowerMessage.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  // Server errors
  if (lowerMessage.includes('internal server error') || lowerMessage.includes('500')) {
    return 'Server error. Please try again later.'
  }

  if (lowerMessage.includes('service unavailable') || lowerMessage.includes('503')) {
    return 'Service temporarily unavailable. Please try again later.'
  }

  // Permission errors
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission denied')) {
    return 'You do not have permission to perform this action.'
  }

  // Rate limiting
  if (lowerMessage.includes('too many requests') || lowerMessage.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.'
  }

  // Default fallback - return original message if no pattern matches
  // This ensures we don't lose important error information
  return message
}
