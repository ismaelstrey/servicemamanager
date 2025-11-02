import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Contextos
import { AuthProvider } from './contexts/AuthContext'
import { ClientAuthProvider } from './contexts/ClientAuthContext'
import { useAuth } from './hooks/useAuth'

// Estilos
// Tema é gerenciado via ThemeModeProvider em main.tsx

// Páginas
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/register'
import DashboardPage from './pages/dashboard'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import TestPage from './pages/TestPage'
import CreateProviderPage from './pages/providers/CreateProviderPage'
import ProvidersListPage from './pages/providers/ProvidersListPage'
import ProviderDetailsPage from './pages/providers/ProviderDetailsPage'
import ClientLoginPage from './pages/client/LoginPage'
import ClientDashboardPage from './pages/client/DashboardPage'

// Layout
import { Layout } from './components/layout'
import ClientProtectedRoute from './components/auth/ClientProtectedRoute'
import ClientPublicRoute from './components/auth/ClientPublicRoute'

// Cliente React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Carregando...
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente para rotas públicas (apenas para usuários não autenticados)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Carregando...
      </div>
    )
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

// Componente principal da aplicação
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClientAuthProvider>
            <Routes>
            {/* Rotas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Portal do Cliente - rotas públicas */}
            <Route
              path="/client/login"
              element={
                <ClientPublicRoute>
                  <ClientLoginPage />
                </ClientPublicRoute>
              }
            />

            {/* Rotas protegidas */}
            <Route
              path="/dashboard"
              element={
               <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/providers"
              element={
               <ProtectedRoute>
                   <Layout>
                     <ProvidersListPage />
                   </Layout>
                 </ProtectedRoute>
               }
             />
            <Route
              path="/providers/:id"
              element={
               <ProtectedRoute>
                   <Layout>
                     <ProviderDetailsPage />
                   </Layout>
                 </ProtectedRoute>
               }
             />
         <Route
            path="/providers/create"
            element={
             <ProtectedRoute>
                 <Layout>
                   <CreateProviderPage />
                 </Layout>
               </ProtectedRoute>
             }
           />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Portal do Cliente - rotas protegidas */}
            <Route
              path="/client/dashboard"
              element={
                <ClientProtectedRoute>
                  <Layout>
                    <ClientDashboardPage />
                  </Layout>
                </ClientProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TestPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirecionamento da raiz */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Página 404 */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </ClientAuthProvider>
      </AuthProvider>

      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default App
