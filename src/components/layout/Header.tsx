/**
 * Top header: Sprint dropdown, global search (UI only), user badge.
 * Sprint selection is shared via SprintContext so dashboard can show selected sprint.
 */

import { useState } from 'react'
import { HiOutlineCalendar, HiOutlineSearch, HiOutlineUserCircle } from 'react-icons/hi'
import { mockSprints } from '../../mock'
import { useSprint } from '../../context/SprintContext'

export function Header() {
  const { selectedSprintId, setSelectedSprintId } = useSprint()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--color-header-border)] bg-white shrink-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Sprint selector */}
        <div className="flex items-center gap-2 shrink-0">
          <HiOutlineCalendar className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" aria-hidden />
          <label htmlFor="sprint-select" className="sr-only">Sprint</label>
          <select
            id="sprint-select"
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)] focus:border-transparent"
          >
            {mockSprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Global search: UI only, no functionality */}
        <div className="flex-1 max-w-md relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" aria-hidden />
          <input
            type="search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] pl-10 pr-3 py-2 text-sm placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
          />
        </div>
      </div>

      {/* User badge placeholder */}
      <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-full bg-[var(--color-oracle-orange)] flex items-center justify-center text-white shrink-0">
          <HiOutlineUserCircle className="w-5 h-5" aria-hidden />
        </div>
        <span className="text-sm font-medium text-[var(--color-text)] hidden sm:inline">Admin Oracle</span>
      </div>
    </header>
  )
}
