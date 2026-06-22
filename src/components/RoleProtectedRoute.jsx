import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Usage:
 * <RoleProtectedRoute allowedRoles={['admin','super_admin']}>
 *    <SomePage />
 * </RoleProtectedRoute>
 */
export default function RoleProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Checking authorization...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User role not allowed
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <h1>Access Denied! 🚫</h1> 
        <br />
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // Authorized
  return <Outlet />;
}
