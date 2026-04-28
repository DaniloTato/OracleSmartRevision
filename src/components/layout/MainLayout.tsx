/**
 * Main app layout: sidebar + header + content area.
 * Renders child routes via Outlet.
 */

import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout() {
    const { pathname } = useLocation()

    const isAiPage = pathname === '/ai-reports'

    return (
        <div className={`flex min-h-screen ${isAiPage ? 'dark-page' : ''}`}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 flex flex-col min-h-0 p-6 overflow-auto bg-layout">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}