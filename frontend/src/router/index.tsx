import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';
import RequireRole from '../auth/RequireRole';
import Layout from '../components/Layout';

import Home from '../pages/Home/Home';
import Clientes from '../pages/Clientes/Clientes';
import Planes from '../pages/Planes/Planes';
import Suscripciones from '../pages/Suscripciones/Suscripciones';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import Login from '../pages/Login/Login';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },

  // Zona autenticada (cualquier rol)
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },          // equivale a path: ''
          { path: 'clientes', element: <Clientes /> }, // OJO: sin slash
          { path: 'planes', element: <Planes /> },
          { path: 'suscripciones', element: <Suscripciones /> },
        ],
      },
    ],
  },

  // Solo admin
  {
    element: <RequireRole anyOf={['admin']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: 'admin', element: <AdminDashboard /> }, // sin slash
        ],
      },
    ],
  },

  // Fallback: cualquier otra ruta → Home (autenticada)
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '*', element: <Home /> },
        ],
      },
    ],
  },
]);

export default router;
