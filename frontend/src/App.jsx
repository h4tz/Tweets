import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

/**
 * The auth store persists to localStorage synchronously, so there is no async
 * bootstrap to wait for. Deliberately no `isLoading` gate here: unmounting the
 * router mid-request would throw away whatever the user has typed in the form.
 */
function App() {
  const { isAuthenticated, isGuest } = useAuthStore()
  const hasAccess = isAuthenticated || isGuest

  return (
    <Router>
      <Routes>
        <Route path="/" element={hasAccess ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route
          path="/register"
          element={hasAccess ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route path="/dashboard" element={hasAccess ? <DashboardPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
