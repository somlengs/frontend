'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/liquid-glass-button'
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave'
import { BrushUnderlineBold } from '@/components/ui/brush-underline'
import { Header } from '@/components/ui/navbar'
import { useSignIn } from '@/hooks'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

export default function SignInSection() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const { signIn, isLoading } = useSignIn()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const result = await signIn({ email, password })

    if (result.success) {
      // Redirect to dashboard after successful signin
      // Let middleware handle the redirect by refreshing the page
      window.location.href = '/dashboard'
    } else {
      // Handle different error scenarios
      const errorMsg = result.error || 'Sign in failed'

      // Check for specific error types
      if (errorMsg.toLowerCase().includes('email not confirmed')) {
        setFormError('Please verify your email address. Check your inbox for the verification link.')
      } else if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('credentials')) {
        setFormError('Invalid email or password. Please check your credentials and try again.')
      } else {
        setFormError(errorMsg)
      }
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email address')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setResetMessage(error.message)
      } else {
        setResetMessage('Password reset link sent! Check your email.')
        setTimeout(() => {
          setShowForgotPassword(false)
          setResetEmail('')
          setResetMessage(null)
        }, 3000)
      }
    } catch {
      setResetMessage('Failed to send reset email. Please try again.')
    }
  }


  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-text mb-2">
              <BrushUnderlineBold variant="accent" animated>Welcome Back</BrushUnderlineBold>
            </h1>
            <p className="text-muted-foreground">
              Sign in to your Somleng account
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                  required
                  className={`w-full px-4 py-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${formError ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-ring focus:border-transparent'
                    }`}
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                  required
                  className={`w-full px-4 py-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${formError ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-ring focus:border-transparent'
                    }`}
                  placeholder="Enter your password"
                />
              </div>

              {/* Error Message */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  <p className="font-medium">⚠️ {formError}</p>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setResetEmail(email); }}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full bg-accent text-text hover:bg-accent/90 transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="group relative">
                    <span className="group-hover:hidden">Sign In</span>
                    <span className="hidden group-hover:inline-block">
                      <TextShimmerWave
                        waveOnly={true}
                        fontSize="1.1rem"
                      >
                        Sign In
                      </TextShimmerWave>
                    </span>
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            {/* <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div> */}

            {/* Social Sign In */}
            {/* <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div> */}

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {resetMessage && (
              <div className={`px-4 py-3 rounded-md text-sm ${resetMessage.includes('sent')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                <p className="font-medium">
                  {resetMessage.includes('sent') ? '✅' : '⚠️'} {resetMessage}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForgotPassword(false)
                setResetEmail('')
                setResetMessage(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              className="bg-accent text-text hover:bg-accent/90"
            >
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
