const BASE_URL = '/api'

export interface LoginResponse {
    token: string
    userId: number
    email: string
    name: string
    roleId: number
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid email or password.')
        throw new Error('Something went wrong. Please try again.')
    }

    return res.json()
}
