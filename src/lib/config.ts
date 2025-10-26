// Simple API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
}

// API Routes (Direct Supabase calls - no proxy needed)
export const API_ROUTES = {
  AUTH: {
    SIGNIN: '/api/v1/auth/signin',
    SIGNUP: '/api/v1/auth/signup',
  },
  PROJECTS: {
    LIST: '/api/v1/projects',
    CREATE: '/api/v1/projects',
    GET: (id: string) => `/api/v1/projects/${id}`,
    UPDATE: (id: string) => `/api/v1/projects/${id}`,
    DELETE: (id: string) => `/api/v1/projects/${id}`,
  }
}

// Route Protection Configuration - Based on actual app structure
export const ROUTE_CONFIG = {
  // Routes that require authentication (all dashboard routes)
  PROTECTED_ROUTES: [
    '/dashboard',
    '/dashboard/projects',
    '/dashboard/projects/new',
    '/dashboard/projects/[id]',
    '/dashboard/projects/[id]/upload',
    '/dashboard/projects/[id]/export',
    '/dashboard/projects/[id]/transcriptions',
    '/dashboard/projects/[id]/transcriptions/[fileId]',
  ],
  
  // Routes that redirect to dashboard if user is authenticated
  AUTH_ROUTES: [
    '/signin',
    '/signup',
  ],
  
  // Public routes (accessible to everyone)
  PUBLIC_ROUTES: [
    '/',
  ],
  
  // Default redirects
  DEFAULT_REDIRECTS: {
    AUTHENTICATED: '/dashboard',
    UNAUTHENTICATED: '/signin',
  }
}
