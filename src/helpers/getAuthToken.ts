export function getAuthToken(): string | null {
    const raw = localStorage.getItem('omi_auth')

    if (!raw) return null

    try {
        return JSON.parse(raw).token
    } catch {
        return null
    }
}
