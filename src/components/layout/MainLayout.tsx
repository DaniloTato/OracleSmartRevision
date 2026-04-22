/**
 * Main app layout: sidebar + header + content area.
 * Renders child routes via Outlet.
 */

import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout() {
   return (
      <div className="flex min-h-screen">
         <Sidebar />
         <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 flex flex-col min-h-0 p-6 overflow-auto bg-white">
               <Outlet />
            </main>
         </div>
      </div>
   )
}
