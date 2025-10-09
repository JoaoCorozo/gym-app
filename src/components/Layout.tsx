import { Link, Outlet, useLocation } from 'react-router-dom';
import { tokenStorage } from '../utils/storage';

export default function Layout() {
  const loc = useLocation();

  const logout = () => {
    tokenStorage.clear();
    window.location.href = '/login';
  };

  const linkStyle = (path: string) => ({
    padding: '8px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    color: loc.pathname === path ? '#0b5' : '#123',
    background: loc.pathname === path ? '#e8fff3' : 'transparent',
  });

  return (
    <div>
      <header style={{
        display:'flex', gap:12, alignItems:'center',
        padding:'12px 16px', borderBottom:'1px solid #eee'
      }}>
        <strong>Gym App</strong>
        <nav style={{ display:'flex', gap:8 }}>
          <Link to="/" style={linkStyle('/')}>Home</Link>
          <Link to="/clientes" style={linkStyle('/clientes')}>Clientes</Link>
        </nav>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
