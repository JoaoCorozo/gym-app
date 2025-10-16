import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Planes from './pages/Planes/Planes';
import Clientes from './pages/Clientes/Clientes';
import Suscripciones from './pages/Suscripciones/Suscripciones';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Ubicacion from './pages/Ubicacion/Ubicacion';
import { ProtectedRoute } from './auth/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="planes" element={<Planes />} />
          <Route path="ubicacion" element={<Ubicacion />} />

          <Route path="clientes" element={<ProtectedRoute roles={['admin']}><Clientes /></ProtectedRoute>} />
          <Route path="suscripciones" element={<ProtectedRoute roles={['admin']}><Suscripciones /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
