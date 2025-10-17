import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useMemo } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from './components/protectedRoute'
import { LoginPage } from './pages/login'
import { DashboardPage } from './pages/dashboard'

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
