import { Navigate } from "react-router-dom";
import { useAuthStore } from "../lib/auth-store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return null; // App.tsx כבר מציג spinner

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
