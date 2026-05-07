import { Navigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth";

export function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: Role;
}) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
}
