// Simple API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080',
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
}

// Backend API Routes (protected by Next.js API proxy)
export const BACKEND_API_ROUTES = {
  PROJECTS: {
    LIST: '/v1/project',
    CREATE: '/v1/project',
    GET: (id: string) => `/v1/project/${id}`,
    UPDATE: (id: string) => `/v1/project/${id}`,
    DELETE: (id: string) => `/v1/project/${id}`,
    PROCESS: (id: string) => `/v1/project/${id}/process`,
    FILES: {
      LIST: (id: string) => `/v1/project/${id}/files`,
      CREATE: (id: string) => `/v1/project/${id}/files`,
      UPDATE: (id: string, fileId: string) => `/v1/project/${id}/files/${fileId}`,
      DELETE: (id: string, fileId: string) => `/v1/project/${id}/files/${fileId}`,
    },
    DOWNLOAD: (id: string) => `/v1/project/${id}/download`,
  }
}

// Next.js API Proxy Routes (frontend calls these)
export const API_ROUTES = {
  AUTH: {
    SIGNIN: '/api/v1/auth/signin',
    SIGNUP: '/api/v1/auth/signup',
  },
  PROJECTS: {
    LIST: '/api/v1/project',
    CREATE: '/api/v1/project',
    GET: (id: string) => `/api/v1/project/${id}`,
    UPDATE: (id: string) => `/api/v1/project/${id}`,
    DELETE: (id: string) => `/api/v1/project/${id}`,
    PROCESS: (id: string) => `/api/v1/project/${id}/process`,
    FILES: {
      LIST: (id: string) => `/api/v1/project/${id}/files`,
      CREATE: (id: string) => `/api/v1/project/${id}/files`,
      UPDATE: (id: string, fileId: string) => `/api/v1/project/${id}/files/${fileId}`,
      DELETE: (id: string, fileId: string) => `/api/v1/project/${id}/files/${fileId}`,
    },
    DOWNLOAD: (id: string) => `/api/v1/project/${id}/download`,
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
