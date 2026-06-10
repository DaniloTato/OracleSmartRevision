import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as apiLogin, type LoginResponse } from '../api/authApi'

interface AuthUser {
    token: string
    userId: number
    email: string
    name: string
    roleId: number
}

interface AuthContextValue {
    user: AuthUser | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'omi_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Rehydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setUser(JSON.parse(stored))
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const data: LoginResponse = await apiLogin(email, password)
        const authUser: AuthUser = data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
        setUser(authUser)
    }

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
