import { createBrowserRouter } from 'react-router-dom';
import Guard from '../auth/Guard';
import AdminGuard from '../auth/AdminGuard';
import Layout from '../components/Layout';
import Home from '../pages/Home/Home';
import Clientes from '../pages/Clientes/Clientes';
import Planes from '../pages/Planes/Planes';
import Suscripciones from '../pages/Suscripciones/Suscripciones';
import Login from '../pages/Login/Login';
import AdminDashboard from '../pages/Admin/AdminDashboard';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },

  // usuario normal
  {
    path: '/',
    element: <Guard />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'clientes', element: <Clientes /> },
          { path: 'planes', element: <Planes /> },
          { path: 'suscripciones', element: <Suscripciones /> },
        ],
      },
    ],
  },

  // solo admin
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <AdminDashboard /> },
        ],
      },
    ],
  },
]);

export default router;
