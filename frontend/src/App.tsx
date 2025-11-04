import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Contextos
import { AuthProvider } from './contexts/AuthContext'
import { ClientAuthProvider } from './contexts/ClientAuthContext'
import { useAuth } from './hooks/useAuth'

// Estilos
// Tema é gerenciado via ThemeModeProvider em main.tsx

// Páginas (code splitting com React.lazy)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const RegisterPage = lazy(() => import('./pages/register'))
const DashboardPage = lazy(() => import('./pages/dashboard'))
const TicketsListPage = lazy(() => import('./pages/tickets/TicketsListPage').then(m => ({ default: m.TicketsListPage })))
const CreateTicketPage = lazy(() => import('./pages/tickets/CreateTicketPage'))
const TicketDetailsPage = lazy(() => import('./pages/tickets/TicketDetailsPage').then(m => ({ default: m.TicketDetailsPage })))
const TicketsKanbanPage = lazy(() => import('./pages/tickets/TicketsKanbanPage'))
const ServiceOrdersKanbanPage = lazy(() => import('./pages/service-orders/ServiceOrdersKanbanPage'))
const ServiceOrdersListPage = lazy(() => import('./pages/service-orders/ServiceOrdersListPage'))
const ServiceOrderDetailsPage = lazy(() => import('./pages/service-orders/ServiceOrderDetailsPage'))
const CreateServiceOrderPage = lazy(() => import('./pages/service-orders/CreateServiceOrderPage'))
const ServiceOrdersCalendarPage = lazy(() => import('./pages/service-orders/ServiceOrdersCalendarPage'))
const ServiceOrdersSlaReportsPage = lazy(() => import('./pages/service-orders/ServiceOrdersReportsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const CreateProviderPage = lazy(() => import('./pages/providers/CreateProviderPage'))
const ProvidersListPage = lazy(() => import('./pages/providers/ProvidersListPage'))
const ProviderDetailsPage = lazy(() => import('./pages/providers/ProviderDetailsPage'))
const ClientLoginPage = lazy(() => import('./pages/client/LoginPage'))
const ClientDashboardPage = lazy(() => import('./pages/client/DashboardPage'))
const TemplateShowcase = lazy(() => import('./pages/templates/TemplateShowcase'))
const ResponsiveLayoutShowcase = lazy(() => import('./pages/layout/ResponsiveLayoutShowcase'))
const EquipmentsPage = lazy(() => import('./pages/equipments').then(m => ({ default: m.EquipmentsPage })))

// Layout
import { Layout } from './components/layout'
import ClientProtectedRoute from './components/auth/ClientProtectedRoute'
import CommandPalette from './components/CommandPalette'
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
            <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}>Carregando...</div>}>
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

            {/* Recuperação de senha */}
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
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
            {/* Tickets */}
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketsListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateTicketPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/kanban"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketsKanbanPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketDetailsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Equipamentos */}
            <Route
              path="/equipments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EquipmentsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Service Orders */}
            <Route
              path="/service-orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceOrdersListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-orders/kanban"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceOrdersKanbanPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-orders/create"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreateServiceOrderPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-orders/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceOrderDetailsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-orders/calendar"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceOrdersCalendarPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-orders/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceOrdersSlaReportsPage />
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
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TemplateShowcase />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/layout"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveLayoutShowcase />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirecionamento da raiz */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Página 404 */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
        {/* Command Palette global (Ctrl+K) apenas quando autenticado */}
        {(() => {
          // Wrapper inline para acessar contexto apenas dentro dos providers
          const AuthCommandPalette: React.FC = () => {
            const { isAuthenticated } = useAuth()
            return isAuthenticated ? <CommandPalette /> : null
          }
          return <AuthCommandPalette />
        })()}
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
