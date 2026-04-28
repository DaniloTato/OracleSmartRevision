import { NavLink } from 'react-router-dom'
import {
    HiOutlineViewGrid,
    HiOutlineClipboardList,
    HiOutlineSparkles,
} from 'react-icons/hi'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    {
        to: '/task-manager',
        label: 'Gestor de Tareas',
        icon: HiOutlineClipboardList,
    },
    {
        to: '/ai-reports',
        label: 'Reportes de Tareas Atrasadas',
        icon: HiOutlineSparkles,
    },
]

export function Sidebar() {
    return (
        <aside className="w-64 h-screen sticky top-0 shrink-0 border-r border-default bg-surface overflow-hidden">
            <div className="flex h-full flex-col">
                {/* Brand */}
                <div className="border-b border-default px-5 py-6">
                    <div className="mb-4 flex h-24 items-center justify-center">
                        <img
                            src="/images/Logo/BlueLogoTransparent.png"
                            alt="Oracle Smart Productivity"
                            className="max-h-24 w-auto object-contain"
                        />
                    </div>

                    <h1 className="text-base font-semibold leading-tight">
                        Oracle Smart Productivity
                    </h1>

                    <p className="mt-1 text-xs tracking-wide text-muted uppercase">
                        Control Center
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4">
                    <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-muted uppercase">
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
                                                    : 'text-inherit hover:bg-soft'
                                            }`}
                                        >
                                            {isActive && (
                                                <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-l-lg" />
                                            )}

                                            <Icon className="h-5 w-5" />
                                            <span>{label}</span>
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
