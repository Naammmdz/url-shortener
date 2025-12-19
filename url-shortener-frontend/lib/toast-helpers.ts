import { toast } from '@/hooks/use-toast'
import { transformError } from './error-messages'

/**
 * Helper functions for displaying toast notifications with consistent styling
 */

export function showSuccessToast(message: string, description?: string) {
  toast({
    title: message,
    description,
    variant: 'default',
  })
}

export function showErrorToast(error: unknown, fallbackMessage = 'An error occurred') {
  const errorMessage = transformError(error)
  toast({
    title: 'Error',
    description: errorMessage || fallbackMessage,
    variant: 'destructive',
  })
}

export function showInfoToast(message: string, description?: string) {
  toast({
    title: message,
    description,
    variant: 'default',
  })
}

/**
 * Show a loading toast that can be updated later
 */
export function showLoadingToast(message: string) {
  return toast({
    title: message,
    description: 'Please wait...',
    variant: 'default',
  })
}
