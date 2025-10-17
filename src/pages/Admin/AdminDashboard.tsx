import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-neutral-600">Hola {user?.email}, gestiona los recursos del gimnasio.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/clientes" className="card p-6 hover:shadow-md transition">
          <div className="text-lg font-semibold text-forge-800">Clientes</div>
          <div className="text-neutral-600">Crear, editar y eliminar clientes.</div>
        </Link>
        <Link to="/suscripciones" className="card p-6 hover:shadow-md transition">
          <div className="text-lg font-semibold text-forge-800">Suscripciones</div>
          <div className="text-neutral-600">Gestiona membresías y renovaciones.</div>
        </Link>
        <Link to="/admin/planes" className="card p-6 hover:shadow-md transition">
          <div className="text-lg font-semibold text-forge-800">Planes</div>
          <div className="text-neutral-600">Consulta y administra planes.</div>
        </Link>
      </div>
    </div>
  );
}
