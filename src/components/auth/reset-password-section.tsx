'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/liquid-glass-button'
import { Header } from '@/components/ui/navbar'
import { createClient } from '@/lib/supabase/client'
import { BrushUnderlineBold } from '@/components/ui/brush-underline'

export default function ResetPasswordSection() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Check for error parameters in URL
        const params = new URLSearchParams(window.location.search)
        const errorDescription = params.get('error_description')

        if (errorDescription) {
            setError(errorDescription.replace(/\+/g, ' '))
            return
        }

        // Check if we have a session (user clicked the email link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If no session and no URL error, it means the link is invalid or expired
                // or the user navigated here manually
                setError('Invalid or expired password reset link. Please request a new one.')
            }
        }
        checkSession()
    }, [supabase.auth])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                throw error
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-bg flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-serif text-text mb-2">
                            <BrushUnderlineBold variant="accent" animated>Reset Password</BrushUnderlineBold>
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your new password below
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                        {success ? (
                            <div className="text-center space-y-4">
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
                                    <p className="font-medium">✅ Password updated successfully!</p>
                                </div>
                                <p className="text-muted-foreground">Redirecting to dashboard...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                                        <p className="font-medium">⚠️ {error}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                        New Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={!!error && error.includes('link')}
                                        className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={!!error && error.includes('link')}
                                        className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || (!!error && error.includes('link'))}
                                    size="lg"
                                    className="w-full bg-accent text-text hover:bg-accent/90 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Updating Password...' : 'Update Password'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
