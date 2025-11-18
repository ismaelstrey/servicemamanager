import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Contextos
import { AuthProvider } from './contexts/AuthContext'
import { ProviderContextProvider } from './contexts/providerContext'
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
const ChatPage = lazy(() => import('./pages/chat/ChatPage'))
const TicketsListPage = lazy(() => import('./pages/tickets/TicketsListPage').then(m => ({ default: m.TicketsListPage })))
const CreateTicketPage = lazy(() => import('./pages/tickets/CreateTicketPage'))
const TicketDetailsPage = lazy(() => import('./pages/tickets/TicketDetailsPage').then(m => ({ default: m.TicketDetailsPage })))
const TicketsKanbanPage = lazy(() => import('./pages/tickets/TicketsKanbanPage'))
const TicketsEditPage = lazy(() => import('./pages/tickets/TicketsEditPage'))
const ServiceOrdersKanbanPage = lazy(() => import('./pages/service-orders/ServiceOrdersKanbanPage'))
const ServiceOrdersListPage = lazy(() => import('./pages/service-orders/ServiceOrdersListPage'))
const ServiceOrderDetailsPage = lazy(() => import('./pages/service-orders/ServiceOrderDetailsPage'))
const CreateServiceOrderPage = lazy(() => import('./pages/service-orders/CreateServiceOrderPage'))
const ServiceOrdersCalendarPage = lazy(() => import('./pages/service-orders/ServiceOrdersCalendarPage'))
const ServiceOrdersSlaReportsPage = lazy(() => import('./pages/service-orders/ServiceOrdersReportsPage'))
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const CreateProviderPage = lazy(() => import('./pages/providers/CreateProviderPage'))
const ProvidersListPage = lazy(() => import('./pages/providers/ProvidersListPage'))
const ProviderDetailsPage = lazy(() => import('./pages/providers/ProviderDetailsPage'))
const ProviderSettingsPage = lazy(() => import('./pages/providers/ProviderSettingsPage'))
const ClientLoginPage = lazy(() => import('./pages/client/LoginPage'))
const ClientDashboardPage = lazy(() => import('./pages/client/DashboardPage'))
const ClientTicketDetailsPage = lazy(() => import('./pages/client/TicketDetailsPage'))
const ClientServiceOrderDetailsPage = lazy(() => import('./pages/client/ServiceOrderDetailsPage'))
const TemplateShowcase = lazy(() => import('./pages/templates/TemplateShowcase'))
const ResponsiveLayoutShowcase = lazy(() => import('./pages/layout/ResponsiveLayoutShowcase'))
const EquipmentsPage = lazy(() => import('./pages/equipments').then(m => ({ default: m.EquipmentsPage })))
const UsersListPage = lazy(() => import('./pages/users/UsersListPage').then(m => ({ default: m.UsersListPage })))
const UserFormPage = lazy(() => import('./pages/users/UserFormPage').then(m => ({ default: m.UserFormPage })))
const CustomersListPage = lazy(() => import('./pages/customers/CustomersListPage').then(m => ({ default: m.CustomersListPage })))

// Layout
import { Layout } from './components/layout'
import { LogoLoader } from './components/ui'
import ClientProtectedRoute from './components/auth/ClientProtectedRoute'
import CommandPalette from './components/CommandPalette'
import ClientPublicRoute from './components/auth/ClientPublicRoute'
import { TicketCreateModalProvider } from './contexts/ticketCreateModalContext'
import { TicketCreateModalGlobalBridge } from './contexts/ticketCreateModalContext'

// Cliente React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: "always",
      refetchOnReconnect: true,
      refetchOnMount: true,
      staleTime: 0,
      refetchInterval: 60_000,

    },
    mutations: {
      gcTime: 60_000,

    }
  },
})

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LogoLoader fullscreen message="Verificando autenticação..." />
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente para rotas públicas (apenas para usuários não autenticados)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LogoLoader fullscreen message="Verificando autenticação..." />
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

// Componente principal da aplicação
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClientAuthProvider>
          <ProviderContextProvider>
            <TicketCreateModalProvider>
              <Suspense fallback={<LogoLoader fullscreen message="Carregando..." />}>
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
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ChatPage />
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
                    path="/providers/:id/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ProviderSettingsPage />
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
                    path="/client/tickets/:id"
                    element={
                      <ClientProtectedRoute>
                        <Layout>
                          <ClientTicketDetailsPage />
                        </Layout>
                      </ClientProtectedRoute>
                    }
                  />
                  <Route
                    path="/client/service-orders/:id"
                    element={
                      <ClientProtectedRoute>
                        <Layout>
                          <ClientServiceOrderDetailsPage />
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
                  {/* Reports */}
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ReportsPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  {/* Users */}
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <UsersListPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/new"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <UserFormPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/:id"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <UserFormPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  {/* Customers */}
                  <Route
                    path="/customers"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <CustomersListPage />
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
                  <Route
                    path="/tickets/:id/edit"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <TicketsEditPage />
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
              <TicketCreateModalGlobalBridge />
              {/* Command Palette global (Ctrl+K) apenas quando autenticado */}
              {(() => {
                // Wrapper inline para acessar contexto apenas dentro dos providers
                const AuthCommandPalette: React.FC = () => {
                  const { isAuthenticated } = useAuth()
                  return isAuthenticated ? <CommandPalette /> : null
                }
                return <AuthCommandPalette />
              })()}
            </TicketCreateModalProvider>
          </ProviderContextProvider>
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
