import { usePlanes } from './usePlanes';
import PlanForm from './PlanForm';
import { userStorage } from '../../utils/storage';

export default function Planes() {
  const { data, isLoading, isError } = usePlanes();
  const user = userStorage.get();
  const isAdmin = user?.role === 'admin';

  if (isLoading) return <div style={{ padding: 24 }}>Cargando planes…</div>;
  if (isError) return <div style={{ padding: 24, color: 'crimson' }}>Error al cargar planes</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Planes</h1>

      {/* Solo los administradores pueden crear nuevos planes */}
      {isAdmin && <PlanForm />}

      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Vigencia (días)</th></tr>
        </thead>
        <tbody>
          {data?.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.precio}</td>
              <td>{p.vigenciaDias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
