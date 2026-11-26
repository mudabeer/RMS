import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import PageLoader from "./components/Loaders/PageLoader.jsx";

const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage.jsx"));
const RegistrationPage = lazy(() => import("./pages/registrationPage/RegistrationPage.jsx"));
const SendOtpPage = lazy(() => import("./pages/SendOtpPage/SendOtpPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage/ResetPasswordPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage/DashboardPage.jsx"));
const MyRoomsPage = lazy(() => import("./pages/MyRoomsPage/MyRoomsPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage/ProfilePage.jsx"));
const RoomDetailsPage = lazy(() => import("./pages/RoomDetailsPage/RoomDetailsPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.jsx"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/send-otp" element={<SendOtpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-rooms" element={<MyRoomsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
