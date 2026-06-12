import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth()

    if (isLoading) return null // avoids flash before localStorage rehydrates

    if (!user) return <Navigate to="/login" replace />

    return <>{children}</>
}
