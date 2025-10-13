import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="card p-0 overflow-hidden">
        <div className="hero-bg">
          <div className="px-6 py-10 md:px-10 md:py-14 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-forge-100 text-forge-700 px-3 py-1 text-xs font-semibold ring-1 ring-forge-200">
                Nuevo • Panel BodyForge
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">
                Forja tu mejor versión con <span className="text-forge-700">BodyForge</span>
              </h1>
              <p className="mt-2 text-neutral-700">
                Administra clientes, planes y suscripciones con un panel rápido, claro y centrado en resultados.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/clientes" className="btn">Gestionar clientes</Link>
                <Link to="/planes" className="btn-ghost">Ver planes</Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="aspect-[4/3] rounded-2xl bg-[rgba(255,127,14,0.12)] border border-[rgba(255,127,14,0.35)] flex items-center justify-center">
                <div className="text-forge-700 font-semibold">Dashboard BodyForge</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link to="/clientes" className="card p-5 hover:shadow-lg transition">
          <div className="text-sm text-[var(--muted)]">Acceso rápido</div>
          <div className="mt-2 font-semibold">Clientes</div>
          <p className="text-sm text-neutral-700">Crea, edita y gestiona tus clientes.</p>
        </Link>
        <Link to="/planes" className="card p-5 hover:shadow-lg transition">
          <div className="text-sm text-[var(--muted)]">Acceso rápido</div>
          <div className="mt-2 font-semibold">Planes</div>
          <p className="text-sm text-neutral-700">Define precios y vigencias a tu medida.</p>
        </Link>
        <Link to="/suscripciones" className="card p-5 hover:shadow-lg transition">
          <div className="text-sm text-[var(--muted)]">Acceso rápido</div>
          <div className="mt-2 font-semibold">Suscripciones</div>
          <p className="text-sm text-neutral-700">Control en tiempo real del estado.</p>
        </Link>
      </section>
    </div>
  );
}
