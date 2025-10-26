import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if current route is protected
  const isProtectedRoute = pathname.startsWith('/dashboard')

  // Check if current route is auth route
  const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup')

  // Check if current route is public (landing page)
  const isPublicRoute = pathname === '/'

  // Get user from Supabase (more secure than getSession)
  let user = null
  try {
    const { data: { user: userData }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Supabase auth error:', error)
    }

    user = userData
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error with Supabase, redirect to signin for safety
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  // Redirect logic
  if (isProtectedRoute && !user) {
    // Redirect to signin if trying to access protected route without authentication
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (isAuthRoute && user) {
    // Redirect to dashboard if authenticated user tries to access auth pages
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isPublicRoute && user) {
    // Redirect authenticated users from landing page to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
