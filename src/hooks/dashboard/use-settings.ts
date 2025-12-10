import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
    email: string
    firstName: string
    lastName: string
}

export function useSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form states
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')

    // Password states
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        const getUser = async () => {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    setEmail(user.email || '')
                    setFirstName(user.user_metadata?.first_name || '')
                    setLastName(user.user_metadata?.last_name || '')
                }
            } catch (err) {
                console.error('Error fetching user:', err)
                setError('Failed to load user profile')
            } finally {
                setLoading(false)
            }
        }
        getUser()
    }, [])

    const updateProfile = async () => {
        setSaving(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            })

            if (error) throw error
            return { success: true }
        } catch (error: unknown) {
            console.error('Error updating profile:', error)
            const msg = error instanceof Error ? error.message : 'Failed to update profile'
            setError(msg)
            return { success: false, error: msg }
        } finally {
            setSaving(false)
        }
    }

    const updatePassword = async () => {
        if (!oldPassword) {
            return { success: false, error: 'Current password is required' }
        }

        if (newPassword !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' }
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' }
        }

        setPasswordSaving(true)
        setError(null)

        try {
            const supabase = createClient()

            // First verify the old password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: oldPassword
            })

            if (signInError) {
                throw new Error('Current password is incorrect')
            }

            // If verification successful, update to new password
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
            return { success: true }
        } catch (error: unknown) {
            console.error('Error updating password:', error)
            const msg = error instanceof Error ? error.message : 'Failed to update password'
            setError(msg)
            return { success: false, error: msg }
        } finally {
            setPasswordSaving(false)
        }
    }

    return {
        loading,
        saving,
        passwordSaving,
        error,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        oldPassword,
        setOldPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        updateProfile,
        updatePassword
    }
}
