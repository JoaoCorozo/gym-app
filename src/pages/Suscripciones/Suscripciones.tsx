import { useSuscripciones, usePlanesLite } from './useSuscripciones';
import SuscripcionForm from './SuscripcionForm';
import { userStorage } from '../../utils/storage';

export default function Suscripciones() {
  const { data, isLoading, isError } = useSuscripciones();
  const { data: planes } = usePlanesLite();
  const user = userStorage.get();
  const isAdmin = user?.role === 'admin';

  const planName = (id: number) => planes?.find((p) => p.id === id)?.nombre ?? id;

  if (isLoading) return <div style={{ padding: 24 }}>Cargando suscripciones…</div>;
  if (isError) return <div style={{ padding: 24, color: 'crimson' }}>Error al cargar suscripciones</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Suscripciones</h1>

      {/* Solo admin puede crear */}
      {isAdmin && <SuscripcionForm />}

      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th><th>Cliente</th><th>Plan</th><th>Inicio</th><th>Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((s) => (
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
  );
}
