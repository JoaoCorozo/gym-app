import { Navigate, Outlet } from 'react-router-dom';
import { userStorage } from '../utils/storage';

export default function AdminGuard() {
  const user = userStorage.get();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
