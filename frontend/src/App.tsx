import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Planes from './pages/Planes/Planes';
import Clientes from './pages/Clientes/Clientes';
import Suscripciones from './pages/Suscripciones/Suscripciones';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Ubicacion from './pages/Ubicacion/Ubicacion';
import Clases from './pages/Clases/Clases';
import PlanesAdmin from './pages/Planes/PlanesAdmin';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Pagar from './pages/Checkout/Pagar';
import ResultadoPago from './pages/Checkout/ResultadoPago';
import ClasesAdmin from './pages/Admin/ClasesAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Pública / inicio */}
          <Route index element={<Home />} />

          {/* Planes / pagos */}
          <Route path="planes" element={<Planes />} />
          <Route
            path="pagar/:planId"
            element={
              <ProtectedRoute>
                <Pagar />
              </ProtectedRoute>
            }
          />
          <Route path="resultado-pago" element={<ResultadoPago />} />

          {/* Otras públicas */}
          <Route path="ubicacion" element={<Ubicacion />} />

          {/* Clases: vista cliente (redirecciona a admin si rol=admin) */}
          <Route
            path="clases"
            element={
              <ProtectedRoute>
                <Clases />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="clientes"
            element={
              <ProtectedRoute roles={['admin']}>
                <Clientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="suscripciones"
            element={
              <ProtectedRoute roles={['admin']}>
                <Suscripciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/planes"
            element={
              <ProtectedRoute roles={['admin']}>
                <PlanesAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/clases"
            element={
              <ProtectedRoute roles={['admin']}>
                <ClasesAdmin />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
