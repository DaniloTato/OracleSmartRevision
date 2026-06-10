const BASE_URL = '/api'

function getToken(): string | null {
    try {
        const raw = localStorage.getItem('omi_auth')

        if (!raw) return null

        const auth = JSON.parse(raw)

        return auth.token ?? null
    } catch {
        return null
    }
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken()

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {}),
            ...(options.headers || {}),
        },
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
    }

    const text = await res.text()

    if (!text) {
        return null as T
    }

    return JSON.parse(text) as T
}
