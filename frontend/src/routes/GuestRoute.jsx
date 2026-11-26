import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/Loaders/PageLoader";

export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}