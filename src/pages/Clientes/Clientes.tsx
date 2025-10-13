import { useState } from 'react';
import { useClientes, useDeleteCliente, useUpdateCliente } from './useClientes';
import ClienteForm from './ClienteForm';
import { userStorage } from '../../utils/storage';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import type { Suscripcion, Cliente } from '../../types/models';
import { estadoMembresiaDeCliente } from '../../selectors/membership';

type EditRow = { id: number; nombre: string; correo: string; telefono?: string; estadoMembresia: string };

export default function Clientes() {
  const { data, isLoading, isError } = useClientes();
  const del = useDeleteCliente();
  const upd = useUpdateCliente();

  // compat compat (puede venir de userStorage con role o roles[])
  const user = userStorage.get() as any;
  const isAdmin: boolean = !!(user?.role === 'admin' || user?.roles?.includes?.('admin'));

  // suscripciones para calcular estado visual
  const subsQ = useQuery({
    queryKey: ['suscripciones'],
    queryFn: async () => (await api.get<Suscripcion[]>('/suscripciones')).data,
  });

  const [editing, setEditing] = useState<EditRow | null>(null);
  const isRow = (id: number) => editing?.id === id;

  if (isLoading || subsQ.isLoading)
    return (
      <div className="p-6">
        <Spinner label="Cargando clientes..." />
      </div>
    );

  if (isError || subsQ.isError)
    return <div className="p-6 text-rose-600">Error al cargar clientes</div>;

  const clientes = (data ?? []) as Cliente[];
  const suscripciones = subsQ.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        {isAdmin && <a href="#nuevo" className="btn">Nuevo</a>}
      </div>

      {isAdmin && <ClienteForm />}

      {clientes.length === 0 ? (
        <div className="card p-6 text-gray-600">No hay clientes todavía.</div>
      ) : (
        <div className="card p-2 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-14">ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Estado</th>
                {isAdmin && <th className="w-44">Acciones</th>}
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(odd)]:bg-gray-50/50 [&>tr:hover]:bg-black/5">
              {clientes.map((c) => {
                const e = estadoMembresiaDeCliente(c.id, suscripciones);
                return (
                  <tr key={c.id}>
                    <td>{c.id}</td>

                    <td>
                      {isRow(c.id) ? (
                        <input
                          className="input"
                          value={editing!.nombre}
                          onChange={(ev) => setEditing({ ...editing!, nombre: ev.target.value })}
                        />
                      ) : (
                        c.nombre
                      )}
                    </td>

                    <td>
                      {isRow(c.id) ? (
                        <input
                          className="input"
                          value={editing!.correo}
                          onChange={(ev) => setEditing({ ...editing!, correo: ev.target.value })}
                        />
                      ) : (
                        c.correo
                      )}
                    </td>

                    <td>
                      {isRow(c.id) ? (
                        <input
                          className="input"
                          value={editing!.telefono ?? ''}
                          onChange={(ev) => setEditing({ ...editing!, telefono: ev.target.value })}
                        />
                      ) : (
                        c.telefono ?? '-'
                      )}
                    </td>

                    <td>
                      <Badge kind={(e.estado as any) ?? 'default'}>
                        {e.estado.replace('_', ' ')}
                      </Badge>
                      {e.vencimiento && (
                        <span className="ml-2 text-xs text-gray-500">({e.vencimiento})</span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="whitespace-nowrap">
                        {isRow(c.id) ? (
                          <>
                            <button
                              className="btn"
                              onClick={() =>
                                upd
                                  .mutateAsync({
                                    id: editing!.id,
                                    nombre: editing!.nombre,
                                    correo: editing!.correo,
                                    telefono: editing!.telefono,
                                    estadoMembresia: editing!.estadoMembresia as any,
                                  })
                                  .then(() => setEditing(null))
                              }
                              disabled={upd.isPending}
                            >
                              Guardar
                            </button>
                            <button className="btn-ghost ml-2" onClick={() => setEditing(null)}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn"
                              onClick={() =>
                                setEditing({
                                  id: c.id,
                                  nombre: c.nombre,
                                  correo: c.correo,
                                  telefono: c.telefono,
                                  estadoMembresia: c.estadoMembresia,
                                })
                              }
                            >
                              Editar
                            </button>
                            <button
                              className="btn-ghost ml-2"
                              onClick={() => del.mutate(c.id)}
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
      )}
    </div>
  );
}
