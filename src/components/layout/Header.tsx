import { HiOutlineCalendar } from 'react-icons/hi'
import { useSprint } from '../../context/SprintContext'

export function Header() {
   const { selectedSprintId, setSelectedSprintId, sprints, loading } = useSprint()

   return (
      <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--color-header-border)] bg-white shrink-0">
         <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Sprint selector */}
            <div className="flex items-center gap-2 shrink-0">
               <HiOutlineCalendar
                  className="w-5 h-5 text-[var(--color-text-muted)] shrink-0"
                  aria-hidden
               />

               <label htmlFor="sprint-select" className="sr-only">
                  Sprint
               </label>

               <select
                  id="sprint-select"
                  value={selectedSprintId}
                  onChange={(e) => setSelectedSprintId(Number(e.target.value))}
                  disabled={loading}
                  className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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