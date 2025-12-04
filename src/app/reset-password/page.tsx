import ResetPasswordSection from '@/components/auth/reset-password-section'

export const metadata = {
    title: 'Reset Password - Somleng',
    description: 'Reset your Somleng account password',
}

export const runtime = 'edge'

export default function ResetPasswordPage() {
    return <ResetPasswordSection />
}
