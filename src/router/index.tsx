import { createBrowserRouter } from 'react-router-dom';
import Guard from '../auth/Guard';
import Layout from '../components/Layout';
import Home from '../pages/Home/Home';
import Clientes from '../pages/Clientes/Clientes';
import Login from '../pages/Login/Login';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Guard />,              // protege todo lo de adentro
    children: [
      {
        element: <Layout />,         // navbar + outlet
        children: [
          { index: true, element: <Home /> },
          { path: 'clientes', element: <Clientes /> },
        ],
      },
    ],
  },
]);

export default router;
