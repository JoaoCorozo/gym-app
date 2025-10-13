import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import type { Cliente, Suscripcion, Plan } from '../../types/models';
import { resumenKPI } from '../../selectors/membership';

export default function AdminDashboard() {
  const clientesQ = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => (await api.get<Cliente[]>('/clientes')).data,
  });
  const susQ = useQuery({
    queryKey: ['suscripciones'],
    queryFn: async () => (await api.get<Suscripcion[]>('/suscripciones')).data,
  });
  const planesQ = useQuery({
    queryKey: ['planes'],
    queryFn: async () => (await api.get<Plan[]>('/planes')).data,
  });

  if (clientesQ.isLoading || susQ.isLoading || planesQ.isLoading)
    return <div className="p-6"><Spinner label="Cargando resumen..." /></div>;

  if (clientesQ.isError || susQ.isError || planesQ.isError)
    return <div className="p-6 text-rose-600">Error al cargar datos</div>;

  const clientes = clientesQ.data ?? [];
  const suscripciones = susQ.data ?? [];
  const planes = planesQ.data ?? [];

  const kpi = resumenKPI(clientes, suscripciones);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-neutral-900">Panel de Administración</h1>
      </header>

      {/* KPIs grandes */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat title="Clientes" value={kpi.total} />
        <Stat title="Activos" value={kpi.activas} accent />
        <Stat title="Por vencer" value={kpi.porVencer} />
        <Stat title="Vencidos" value={kpi.vencidas} />
        <Stat title="% Activos" value={`${kpi.activosPct}%`} />
      </section>

      {/* Resúmenes */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold">Planes ({planes.length})</h3>
          <ul className="mt-2 text-sm text-neutral-700 list-disc pl-5">
            {planes.slice(0,5).map(p => (
              <li key={p.id}>{p.nombre} — ${p.precio} / {p.vigenciaDias} días</li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold">Suscripciones recientes</h3>
          <ul className="mt-2 text-sm text-neutral-700 list-disc pl-5">
            {suscripciones
              .slice()
              .sort((a,b)=> b.id - a.id)
              .slice(0,5)
              .map(s => (
                <li key={s.id}>#{s.id} — Cliente {s.clienteId} — Plan {s.planId}</li>
              ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold">Acciones rápidas</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <a className="btn" href="/clientes">Ver clientes</a>
            <a className="btn-ghost" href="/planes">Ver planes</a>
            <a className="btn-ghost" href="/suscripciones">Ver suscripciones</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ title, value, accent }: { title: string; value: string|number; accent?: boolean }) {
  return (
    <div className={`card p-4 ${accent ? 'bg-forge-50 border-forge-200' : ''}`}>
      <div className="text-sm text-neutral-600">{title}</div>
      <div className="text-3xl font-extrabold text-neutral-900">{value}</div>
    </div>
  );
}
