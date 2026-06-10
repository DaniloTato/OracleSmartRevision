import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Label } from '../components/ui/Label'

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
                                <div className="bg-danger-soft text-danger rounded-lg px-3 py-2 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <Label>Email</Label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-2 text-sm text-[var(--color-text)] bg-surface border border-default rounded-lg outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <Label>Password</Label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 text-sm text-[var(--color-text)] bg-surface border border-default rounded-lg outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
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
