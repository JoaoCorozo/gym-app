import { useSuscripciones, usePlanesLite } from './useSuscripciones';
import SuscripcionFormModal from './SuscripcionFormModal';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../auth/AuthContext';
import { useMemo, useState } from 'react';

export default function Suscripciones() {
  const { data, isLoading, isError } = useSuscripciones();
  const { data: planes } = usePlanesLite();
  const { isAdmin } = useAuth();
  const [openNew, setOpenNew] = useState(false);

  const planName = useMemo(
    () => (id: number) => planes?.find(p => p.id === id)?.nombre ?? `#${id}`,
    [planes]
  );

  if (isLoading) return <div className="p-6"><Spinner label="Cargando suscripciones..." /></div>;
  if (isError) return <div className="p-6 text-rose-600">Error al cargar suscripciones</div>;

  const suscripciones = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suscripciones</h1>
        {isAdmin && <button className="btn" onClick={()=>setOpenNew(true)}>Nueva</button>}
      </div>

      {suscripciones.length === 0 ? (
        <div className="card p-6 text-neutral-600">No hay suscripciones todavía.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Plan</th><th>Inicio</th><th>Vencimiento</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(odd)]:bg-neutral-50 [&>tr:hover]:bg-forge-50/60">
              {suscripciones.map(s => (
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

      <SuscripcionFormModal open={openNew} onClose={()=>setOpenNew(false)} />
    </div>
  );
}
