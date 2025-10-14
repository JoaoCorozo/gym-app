import { useMemo, useState } from 'react';
import { useSuscripciones, usePlanesLite } from './useSuscripciones';
import SuscripcionFormModal from './SuscripcionFormModal';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../auth/AuthContext';
import type { Suscripcion, Plan } from '../../types/models';

/** Convierte cualquier forma común de respuesta a un arreglo. */
function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x?.items && Array.isArray(x.items)) return x.items as T[];
  if (x?.data && Array.isArray(x.data)) return x.data as T[];
  return [];
}

export default function Suscripciones() {
  // 🪝 Hooks SIEMPRE en el mismo orden:
  const { data, isLoading, isError } = useSuscripciones();
  const planesQ = usePlanesLite();
  const { isAdmin } = useAuth();
  const [openNew, setOpenNew] = useState(false);

  // 🔒 Normaliza datos ANTES de cualquier return (para no romper el orden de hooks)
  const suscripciones = asArray<Suscripcion>(data);
  const planes = asArray<Plan>(planesQ.data);

  // 🔒 Hooks de memo SIEMPRE llamados (aunque haya loading)
  const planName = useMemo(
    () => (id: number) => planes.find((p) => p.id === id)?.nombre ?? `#${id}`,
    [planes]
  );

  // 🧪 Ahora sí, returns de estados
  if (isLoading || planesQ.isLoading) {
    return (
      <div className="p-6">
        <Spinner label="Cargando suscripciones..." />
      </div>
    );
  }

  if (isError || planesQ.isError) {
    return <div className="p-6 text-rose-600">Error al cargar datos</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suscripciones</h1>
        {isAdmin && <button className="btn" onClick={() => setOpenNew(true)}>Nueva</button>}
      </div>

      {suscripciones.length === 0 ? (
        <div className="card p-6 text-neutral-600">No hay suscripciones todavía.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(odd)]:bg-neutral-50 [&>tr:hover]:bg-forge-50/60">
              {suscripciones.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.clienteId}</td>
                  <td>{planName(s.planId)}</td>
                  <td>{s.fechaInicio}</td>
                  <td>{s.fechaVencimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SuscripcionFormModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
