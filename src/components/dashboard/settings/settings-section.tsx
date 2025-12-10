'use client'

import { Button } from '@/components/ui/liquid-glass-button'
import { Input } from '@/components/ui/input'
import { useSnackbar } from '@/components/ui/snackbar-provider'
import { User, Lock, Save, Loader2 } from 'lucide-react'
import { useSettings } from '@/hooks/dashboard/use-settings'

export default function SettingsSection() {
    const { showSnackbar } = useSnackbar()
    const {
        loading,
        saving,
        passwordSaving,
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
    } = useSettings()

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await updateProfile()
        if (result.success) {
            showSnackbar({ message: 'Profile updated successfully', variant: 'success' })
        } else {
            showSnackbar({ message: result.error || 'Failed to update profile', variant: 'error' })
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await updatePassword()
        if (result.success) {
            showSnackbar({ message: 'Password updated successfully', variant: 'success' })
        } else {
            showSnackbar({ message: result.error || 'Failed to update password', variant: 'error' })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-serif text-text mb-2">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and security preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-bg border border-border rounded-lg p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text">Profile Information</h2>
                        <p className="text-sm text-muted-foreground">Update your personal details</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">First Name</label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">Last Name</label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text">Email Address</label>
                        <Input
                            value={email}
                            disabled
                            className="bg-muted/50 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-bg border border-border rounded-lg p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text">Security</h2>
                        <p className="text-sm text-muted-foreground">Update your password</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text">Current Password</label>
                        <Input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text">New Password</label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text">Confirm New Password</label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" disabled={passwordSaving || !newPassword}>
                            {passwordSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
