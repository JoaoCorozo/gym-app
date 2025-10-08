import { createBrowserRouter } from 'react-router-dom';
import Clientes from '../pages/Clientes/Clientes';

function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Home</h1>
      <a href="/clientes">Ir a Clientes</a>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/clientes', element: <Clientes /> }, // ojo: minúsculas
]);

export default router;

