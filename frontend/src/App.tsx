import type { ReactNode } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { RoomsPage } from './pages/rooms/RoomsPage'
import { RoomDetailsPage } from './pages/rooms/RoomDetailsPage'
import { CreateRoomPage } from './pages/rooms/CreateRoomPage'
import { JoinRoomPage } from './pages/rooms/JoinRoomPage'
import { TransactionsPage } from './pages/transactions/TransactionsPage'
import { CreateTransactionPage } from './pages/transactions/CreateTransactionPage'
import { TransactionDetailsPage } from './pages/transactions/TransactionDetailsPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { LandingPage } from './pages/dashboard/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AppShell } from './layouts/AppShell'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/create" element={<CreateRoomPage />} />
        <Route path="rooms/join" element={<JoinRoomPage />} />
        <Route path="rooms/:roomId" element={<RoomDetailsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/create" element={<CreateTransactionPage />} />
        <Route path="transactions/:roomId/:transactionId" element={<TransactionDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
