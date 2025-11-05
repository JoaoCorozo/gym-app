import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-forge-700">
          Panel de Administración
        </h1>
        <p className="text-neutral-700">
          Gestiona clientes, planes, suscripciones y clases de BodyForge.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Clientes */}
        <Link
          to="/clientes"
          className="card p-6 border border-neutral-200 rounded-2xl hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Clientes
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Crea, edita y elimina los clientes del gimnasio.
            </p>
          </div>
          <div className="mt-4">
            <span className="btn w-full text-center">Gestionar clientes</span>
          </div>
        </Link>

        {/* Planes */}
        <Link
          to="/admin/planes"
          className="card p-6 border border-neutral-200 rounded-2xl hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Planes
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Administra los planes de membresía disponibles para los clientes.
            </p>
          </div>
          <div className="mt-4">
            <span className="btn w-full text-center">Gestionar planes</span>
          </div>
        </Link>

        {/* Suscripciones */}
        <Link
          to="/suscripciones"
          className="card p-6 border border-neutral-200 rounded-2xl hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Suscripciones
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Asigna planes a clientes y controla sus fechas de vigencia.
            </p>
          </div>
          <div className="mt-4">
            <span className="btn w-full text-center">
              Gestionar suscripciones
            </span>
          </div>
        </Link>

        {/* Clases */}
        <Link
          to="/admin/clases"
          className="card p-6 border border-neutral-200 rounded-2xl hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Clases
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Revisa los cupos e inscribe o elimina clientes de las clases diarias.
            </p>
          </div>
          <div className="mt-4">
            <span className="btn w-full text-center">
              Administrar clases
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
