import { Navigate, Outlet } from 'react-router-dom';
import { tokenStorage } from '../utils/storage';

export default function Guard() {
  const token = tokenStorage.get();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
