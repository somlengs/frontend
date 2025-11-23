'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'

const navigation = [
  { name: 'Projects', href: '/dashboard', icon: FolderOpen },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { first_name?: string; last_name?: string } } | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/signin')
        } else if (session?.user) {
          setUser(session.user)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
    getUser()
  }, [router])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/signin')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <div className="h-screen bg-bg overflow-hidden">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div
          className="fixed inset-0 bg-black/50 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
        <div className={cn(
          "fixed inset-y-0 left-0 w-64 bg-bg shadow-xl transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Somleng" width={32} height={32} className="w-8 h-8 border rounded-md" />
              <span className="font-semibold text-lg text-text">Somleng</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-bold",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto">
          <div className="flex h-16 shrink-0 items-center px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Somleng" width={32} height={32} className="w-8 h-8 border rounded-md" />
              <span className="font-semibold text-lg text-text">Somleng</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col px-6 pb-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-md px-3 py-2 text-sm leading-6 transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-auto pt-4 border-t border-border">
              {/* User Info */}
              {user && (
                <div className="mb-4 px-3 py-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.user_metadata?.first_name && user.user_metadata?.last_name
                          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                          : user.user_metadata?.first_name || user.email?.split('@')[0]
                        }
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                size="sm"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 bg-muted/30">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-text lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button
                size="sm"
                className="bg-text text-bg hover:bg-text/90"
                asChild
              >
                <Link href="/dashboard/projects/new" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Link>
              </Button>
            </div>
          </div> */}
        </div>

        {/* Page content with rounded borders */}
        <main className="bg-bg border border-border rounded-md h-[calc(100vh-6rem)] m-4 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="px-6 sm:px-8 lg:px-12 py-6 w-full max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
