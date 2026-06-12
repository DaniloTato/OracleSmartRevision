/**
 * App root: React Router setup and MainLayout.
 * All routes render inside MainLayout with sidebar + header.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { TaskManager } from './pages/TaskManager'
import { AiReportsPage } from './pages/AiReportsPage'
import { LoginPage } from './pages/LoginPage'
import { UnifiedDashboard } from './pages/UnifiedDashboard'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            index
                            element={<Navigate to="/dashboard" replace />}
                        />
                        <Route
                            path="dashboard"
                            element={<UnifiedDashboard />}
                        />
                        <Route path="task-manager" element={<TaskManager />} />
                        <Route path="ai-reports" element={<AiReportsPage />} />
                    </Route>

                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
