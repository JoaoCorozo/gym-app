import { useClientes } from './useClientes';

export default function Clientes() {
  const { data, isLoading, isError } = useClientes();

  if (isLoading) return <div style={{padding:24}}>Cargando clientes...</div>;
  if (isError)   return <div style={{padding:24, color:'crimson'}}>Error al cargar clientes</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Clientes</h1>
      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>{c.correo}</td>
              <td>{c.telefono ?? '-'}</td>
              <td>{c.estadoMembresia}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
