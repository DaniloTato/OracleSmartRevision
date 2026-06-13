import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { TextInput } from '../components/ui/TextInput'

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                {/* Brand */}
                <div className="flex flex-col items-center mb-10">
                    <img
                        src="/images/Logo/BlueLogoTransparent.png"
                        alt="Oracle Smart Productivity"
                        className="max-h-24 w-auto object-contain"
                        data-testid="login-logo"
                    />
                    <p className="text-sm text-muted mt-1">
                        Sign in to your workspace
                    </p>
                </div>

                {/* Card */}
                <Card>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >
                            {/* Error */}
                            {error && (
                                <div
                                    data-testid="login-error"
                                    className="bg-danger-soft text-danger rounded-lg px-3 py-2 text-sm"
                                >
                                    {error}
                                </div>
                            )}

                            <TextInput
                                id="email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="you@example.com"
                                data-testid="login-email"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                placeholder="••••••••"
                                data-testid="login-password"
                            />

                            {/* Submit */}
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                data-testid="login-submit"
                            >
                                {loading ? 'Signing in…' : 'Sign in'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
