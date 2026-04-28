import { HiOutlineCalendar } from 'react-icons/hi'
import { useSprint } from '../../context/SprintContext'

export function Header() {
    const { selectedSprintId, setSelectedSprintId, sprints, loading } =
        useSprint()

    return (
        <header className="h-14 flex items-center justify-between px-6 border-b border-default bg-surface shrink-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                    <HiOutlineCalendar
                        className="w-5 h-5 text-muted"
                        aria-hidden
                    />

                    <select
                        value={selectedSprintId}
                        onChange={(e) =>
                            setSelectedSprintId(Number(e.target.value))
                        }
                        disabled={loading}
                        className="rounded-lg border border-default bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                        {loading ? (
                            <option>Loading...</option>
                        ) : (
                            sprints.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>
        </header>
    )
}