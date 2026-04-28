/**
 * App root: React Router setup and MainLayout.
 * All routes render inside MainLayout with sidebar + header.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SprintProvider } from './context/SprintContext'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { TaskManager } from './pages/TaskManager'
import { AiReportsPage } from './pages/AiReportsPage'

function App() {
    return (
        <BrowserRouter>
            <SprintProvider>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route
                            index
                            element={<Navigate to="/dashboard" replace />}
                        />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="task-manager" element={<TaskManager />} />
                        <Route path="ai-reports" element={<AiReportsPage />} />
                    </Route>
                    <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                    />
                </Routes>
            </SprintProvider>
        </BrowserRouter>
    )
}

export default App
