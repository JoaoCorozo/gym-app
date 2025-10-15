import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Footer from './Footer';

export default function Layout() {
  const loc = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const rolesText = (user?.roles ?? []).join(', '); // <- seguro

  const Item = ({ to, label }: { to: string; label: string }) => {
    const active = loc.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setOpen(false)}
        className={`px-3 py-2 rounded-xl2 transition ${
          active ? 'bg-forge-100 text-forge-800' : 'text-[var(--fg)] hover:bg-black/5'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 py-3">
            {/* Branding */}
            <div className="flex items-center gap-2">
              <img src="/bodyforge.svg" alt="BodyForge" className="h-7 w-7" />
              <div className="font-extrabold text-lg text-forge-600">BodyForge</div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Item to="/" label="Inicio" />
              {/* Público */}
              <Item to="/planes" label="Planes" />
              <Item to="/ubicacion" label="Ubicación" />
              {/* Admin-only */}
              {isAdmin && (
                <>
                  <Item to="/clientes" label="Clientes" />
                  <Item to="/suscripciones" label="Suscripciones" />
                  <Item to="/admin" label="Admin" />
                </>
              )}
            </nav>

            {/* User */}
            <div className="ml-auto hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm text-[var(--muted)]">
                    {user.email}
                    {(user.roles && user.roles.length > 0) ? ` (${rolesText})` : ''}
                  </span>
                  <button className="btn-ghost" onClick={logout}>Salir</button>
                </>
              ) : (
                <span className="text-sm text-[var(--muted)]">Invitado</span>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="ml-auto md:hidden btn-outline"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? 'Cerrar' : 'Menú'}
            </button>
          </div>

          {/* Mobile menu */}
          {open && (
            <div id="mobile-menu" className="md:hidden pb-3">
              <div className="flex flex-col gap-1">
                <Item to="/" label="Inicio" />
                <Item to="/planes" label="Planes" />
                <Item to="/ubicacion" label="Ubicación" />
                {isAdmin && (
                  <>
                    <Item to="/clientes" label="Clientes" />
                    <Item to="/suscripciones" label="Suscripciones" />
                    <Item to="/admin" label="Admin" />
                  </>
                )}
                <div className="pt-2">
                  {user ? (
                    <>
                      <div className="text-xs text-[var(--muted)] mb-2">
                        {user.email}{(user.roles && user.roles.length > 0) ? ` (${rolesText})` : ''}
                      </div>
                      <button className="btn-ghost w-full text-left" onClick={logout}>Salir</button>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">Invitado</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
