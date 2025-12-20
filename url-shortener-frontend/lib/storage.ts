// LocalStorage helpers for anonymous user tracking

const ANONYMOUS_ID_KEY = 'anonymous_id'

export function getAnonymousId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ANONYMOUS_ID_KEY)
}

export function setAnonymousId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ANONYMOUS_ID_KEY, id)
}

export function removeAnonymousId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ANONYMOUS_ID_KEY)
}
