import { useState } from 'react';
import { useClientes, useDeleteCliente, useUpdateCliente } from './useClientes';
import ClienteForm from './ClienteForm';

type EditRow = { id: number; nombre: string; correo: string; telefono?: string; estadoMembresia: string; };

export default function Clientes() {
  const { data, isLoading, isError } = useClientes();
  const del = useDeleteCliente();
  const upd = useUpdateCliente();

  const [editing, setEditing] = useState<EditRow | null>(null);

  const startEdit = (row: EditRow) => setEditing(row);
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    await upd.mutateAsync({ id: editing.id, nombre: editing.nombre, correo: editing.correo, telefono: editing.telefono, estadoMembresia: editing.estadoMembresia as any });
    setEditing(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Clientes</h1>
      <ClienteForm />

      {isLoading && <div>Cargando clientes…</div>}
      {isError && <div style={{ color:'crimson' }}>Error al cargar clientes</div>}

      {!isLoading && !isError && (
        <table border={1} cellPadding={6} cellSpacing={0}>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((c) => {
              const isRow = editing?.id === c.id;
              return (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {isRow ? (
                      <input value={editing!.nombre} onChange={e=>setEditing({ ...editing!, nombre: e.target.value })}/>
                    ) : c.nombre}
                  </td>
                  <td>
                    {isRow ? (
                      <input value={editing!.correo} onChange={e=>setEditing({ ...editing!, correo: e.target.value })}/>
                    ) : c.correo}
                  </td>
                  <td>
                    {isRow ? (
                      <input value={editing!.telefono ?? ''} onChange={e=>setEditing({ ...editing!, telefono: e.target.value })}/>
                    ) : (c.telefono ?? '-')}
                  </td>
                  <td>
                    {isRow ? (
                      <select value={editing!.estadoMembresia} onChange={e=>setEditing({ ...editing!, estadoMembresia: e.target.value })}>
                        <option value="activa">activa</option>
                        <option value="vencida">vencida</option>
                        <option value="morosa">morosa</option>
                      </select>
                    ) : c.estadoMembresia}
                  </td>
                  <td style={{ whiteSpace:'nowrap' }}>
                    {isRow ? (
                      <>
                        <button onClick={saveEdit} disabled={upd.isPending}>Guardar</button>
                        <button onClick={cancelEdit} style={{ marginLeft: 6 }}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit({ id: c.id, nombre: c.nombre, correo: c.correo, telefono: c.telefono, estadoMembresia: c.estadoMembresia })}>Editar</button>
                        <button onClick={() => del.mutate(c.id)} style={{ marginLeft: 6 }} disabled={del.isPending}>Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
