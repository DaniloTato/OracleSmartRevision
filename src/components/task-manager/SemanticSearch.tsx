import { useEffect, useState } from 'react'

import { TextInput } from '../ui/TextInput'
import { semanticSearch } from '../../api/vectorSearchApi'

//maybe the types should go in their own type files...

interface SearchResult {
    id: number
}

interface SemanticSearchProps {
    projectId: number
    onResultsChange: (taskIds: number[] | null) => void
    placeholder?: string
}

export function SemanticSearch({
    projectId,
    onResultsChange,
    placeholder = 'Search tasks...',
}: SemanticSearchProps) {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const trimmed = query.trim()

        if (!trimmed) {
            onResultsChange(null)
            setError(null)
            return
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true)
                setError(null)

                const results: SearchResult[] = await semanticSearch(
                    projectId,
                    trimmed
                )

                onResultsChange(results.map((task) => task.id))
            } catch (err) {
                console.error('SEMANTIC SEARCH FAILED:', err)

                setError('Search failed.')
                onResultsChange([])
            } finally {
                setLoading(false)
            }
        }, 350)

        return () => clearTimeout(timeout)
    }, [query, projectId, onResultsChange])

    return (
        <div className="space-y-2">
            <TextInput
                value={query}
                onChange={setQuery}
                placeholder={placeholder}
            />

            {loading && <p className="text-xs text-muted">Searching...</p>}

            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    )
}
