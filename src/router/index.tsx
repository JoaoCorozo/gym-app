import { createBrowserRouter } from 'react-router-dom';
import Guard from '../auth/Guard';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Clientes from '../pages/Clientes/Clientes';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Guard />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'clientes', element: <Clientes /> }
    ],
  },
]);
