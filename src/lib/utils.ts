import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses error messages and returns user-friendly messages for service outages
 */
export function parseServiceError(error: string | null): {
  title: string
  description: string
  isServiceOutage: boolean
} {
  if (!error) {
    return {
      title: 'Something went wrong',
      description: 'Please try again later.',
      isServiceOutage: false
    }
  }

  const errorLower = error.toLowerCase()
  
  // Service unavailable / server down
  if (errorLower.includes('503') || 
      errorLower.includes('service unavailable') ||
      errorLower.includes('server') && (errorLower.includes('down') || errorLower.includes('unavailable'))) {
    return {
      title: 'Service temporarily unavailable',
      description: 'We\'re having trouble connecting to our servers. This is usually temporary—please try again in a moment.',
      isServiceOutage: true
    }
  }

  // Network / connection errors
  if (errorLower.includes('network') || 
      errorLower.includes('connection') ||
      errorLower.includes('fetch') ||
      errorLower.includes('failed to fetch') ||
      errorLower.includes('networkerror')) {
    return {
      title: 'Connection problem',
      description: 'Unable to reach our servers. Please check your internet connection and try again.',
      isServiceOutage: true
    }
  }

  // Timeout errors
  if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return {
      title: 'Request timed out',
      description: 'The server took too long to respond. This might be temporary—please try again.',
      isServiceOutage: true
    }
  }

  // 500 errors
  if (errorLower.includes('500') || errorLower.includes('internal server error')) {
    return {
      title: 'Server error',
      description: 'Something went wrong on our end. We\'re working on it—please try again in a moment.',
      isServiceOutage: true
    }
  }

  // 404 errors
  if (errorLower.includes('404') || errorLower.includes('not found')) {
    return {
      title: 'Not found',
      description: 'The requested resource could not be found.',
      isServiceOutage: false
    }
  }

  // Generic HTTP errors
  const httpMatch = error.match(/HTTP (\d+)/)
  if (httpMatch) {
    const statusCode = parseInt(httpMatch[1])
    if (statusCode >= 500) {
      return {
        title: 'Server error',
        description: 'Our servers are experiencing issues. Please try again in a moment.',
        isServiceOutage: true
      }
    }
    if (statusCode >= 400 && statusCode < 500) {
      return {
        title: 'Request error',
        description: error, // Keep original message for client errors
        isServiceOutage: false
      }
    }
  }

  // Default: return original error but with friendly wrapper
  return {
    title: 'Unable to load projects',
    description: error,
    isServiceOutage: false
  }
}
