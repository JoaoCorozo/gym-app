import { useState } from 'react';
import { useClientes, useDeleteCliente, useUpdateCliente } from './useClientes';
import ClienteForm from './ClienteForm';
import { userStorage } from '../../utils/storage';

type EditRow = { id: number; nombre: string; correo: string; telefono?: string; estadoMembresia: string };

export default function Clientes() {
  const { data, isLoading, isError } = useClientes();
  const del = useDeleteCliente();
  const upd = useUpdateCliente();
  const user = userStorage.get();
  const isAdmin = user?.role === 'admin';

  const [editing, setEditing] = useState<EditRow | null>(null);

  const startEdit = (row: EditRow) => setEditing(row);
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    await upd.mutateAsync({
      id: editing.id,
      nombre: editing.nombre,
      correo: editing.correo,
      telefono: editing.telefono,
      estadoMembresia: editing.estadoMembresia as any,
    });
    setEditing(null);
  };

  if (isLoading) return <div style={{ padding: 24 }}>Cargando clientes…</div>;
  if (isError) return <div style={{ padding: 24, color: 'crimson' }}>Error al cargar clientes</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Clientes</h1>

      {/* Solo los administradores pueden crear */}
      {isAdmin && <ClienteForm />}

      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Estado</th>
            {isAdmin && <th>Acciones</th>}
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
                    <input
                      value={editing!.nombre}
                      onChange={(e) => setEditing({ ...editing!, nombre: e.target.value })}
                    />
                  ) : (
                    c.nombre
                  )}
                </td>
                <td>
                  {isRow ? (
                    <input
                      value={editing!.correo}
                      onChange={(e) => setEditing({ ...editing!, correo: e.target.value })}
                    />
                  ) : (
                    c.correo
                  )}
                </td>
                <td>
                  {isRow ? (
                    <input
                      value={editing!.telefono ?? ''}
                      onChange={(e) => setEditing({ ...editing!, telefono: e.target.value })}
                    />
                  ) : (
                    c.telefono ?? '-'
                  )}
                </td>
                <td>{c.estadoMembresia}</td>

                {/* Solo admins pueden editar o eliminar */}
                {isAdmin && (
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {isRow ? (
                      <>
                        <button onClick={saveEdit} disabled={upd.isPending}>
                          Guardar
                        </button>
                        <button onClick={cancelEdit} style={{ marginLeft: 6 }}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)}>Editar</button>
                        <button
                          onClick={() => del.mutate(c.id)}
                          style={{ marginLeft: 6 }}
                          disabled={del.isPending}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
