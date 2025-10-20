import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { UserRole } from '../types/auth';

export default function RequireRole({ anyOf }: { anyOf: UserRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const ok = user.roles?.some(r => anyOf.includes(r));
  return ok ? <Outlet /> : <Navigate to="/" replace />;
}
