import { createContext } from 'react'

export interface AuthUser {
    token: string
    userId: number
    email: string
    name: string
    roleId: number
}

export interface AuthContextValue {
    user: AuthUser | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
