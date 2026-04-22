import { NavLink } from 'react-router-dom'
import {
   HiOutlineViewGrid,
   HiOutlineClipboardList,
   HiOutlineChartBar,
   HiOutlineClock,
} from 'react-icons/hi'

const navItems = [
   { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
   {
      to: '/task-manager',
      label: 'Gestor de Tareas',
      icon: HiOutlineClipboardList,
   },
   {
      to: '/team-performance',
      label: 'Rendimiento del Equipo',
      icon: HiOutlineChartBar,
   },
   {
      to: '/activity-log',
      label: 'Historial de Actividad',
      icon: HiOutlineClock,
   },
]

export function Sidebar() {
   return (
      <aside className="w-64 h-screen sticky top-0 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar-bg)] overflow-hidden">
         <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="border-b border-[var(--color-border)] px-5 py-6">
               <div className="mb-4 flex h-24 items-center justify-center">
                  <img
                     src="/images/Logo/BlueLogoTransparent.png"
                     alt="Oracle Smart Productivity"
                     className="max-h-24 w-auto object-contain"
                  />
               </div>

               <h1 className="text-base font-semibold leading-tight text-[var(--color-text)]">
                  Oracle Smart Productivity
               </h1>

               <p className="mt-1 text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
                  Control Center
               </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4" aria-label="Sidebar navigation">
               <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
                  Navegación
               </p>

               <ul className="space-y-1">
                  {navItems.map(({ to, label, icon: Icon }) => (
                     <li key={to}>
                        <NavLink to={to}>
                           {({ isActive }) => (
                              <div
                                 className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                    isActive
                                       ? 'bg-primary/10 text-primary border border-primary/20'
                                       : 'text-[var(--color-text)] hover:bg-gray-100'
                                 }`}
                              >
                                 {isActive && (
                                    <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-l-lg" />
                                 )}

                                 <Icon
                                    className="h-5 w-5 shrink-0 text-inherit"
                                    aria-hidden
                                 />
                                 <span className="leading-tight">{label}</span>
                              </div>
                           )}
                        </NavLink>
                     </li>
                  ))}
               </ul>
            </nav>
         </div>
      </aside>
   )
}
