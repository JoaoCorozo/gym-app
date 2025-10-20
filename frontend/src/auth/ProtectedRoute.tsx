import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactElement;
  roles?: string[]; // ['admin'] etc.
}) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    // no autenticado → vuelve a inicio (login)
    return <Navigate to="/" state={{ from: loc }} replace />;
  }
  if (roles && roles.length > 0) {
    const ok = user.roles?.some((r) => roles.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }
  return children;
}
