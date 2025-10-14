import { useMemo, useState } from 'react';
import { useClientes, useDeleteCliente, useUpdateCliente } from './useClientes';
import { useAuth } from '../../auth/AuthContext';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import type { Suscripcion, Cliente } from '../../types/models';
import { estadoMembresiaDeCliente, resumenKPI } from '../../selectors/membership';
import SearchBar from '../../components/SearchBar';
import type { EstadoFiltro } from '../../components/SearchBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatsBar from '../../components/StatsBar';
import ClienteFormModal from './ClienteFormModal';

/** Normaliza cualquier forma de respuesta a array */
function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x?.items && Array.isArray(x.items)) return x.items as T[];
  if (x?.data && Array.isArray(x.data)) return x.data as T[];
  return [];
}

type EditRow = {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  estadoMembresia: string;
};

export default function Clientes() {
  // 🪝 TODOS los hooks se declaran SIEMPRE y en el mismo orden.
  const { data, isLoading, isError } = useClientes();
  const del = useDeleteCliente();
  const upd = useUpdateCliente();
  const { isAdmin } = useAuth();

  const subsQ = useQuery({
    queryKey: ['suscripciones'],
    queryFn: async () =>
      (await api.get<Suscripcion[] | { items: Suscripcion[] } | { data: Suscripcion[] }>(
        '/suscripciones'
      )).data,
  });

  const [editing, setEditing] = useState<EditRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoFiltro>('todos');

  const [openNew, setOpenNew] = useState(false);

  // 🔒 Datos normalizados SIEMPRE (evita excepciones en mitad del render).
  const clientes = useMemo<Cliente[]>(() => asArray<Cliente>(data), [data]);
  const suscripciones = useMemo<Suscripcion[]>(
    () => asArray<Suscripcion>(subsQ.data),
    [subsQ.data]
  );

  // KPIs y enriquecimiento siempre calculados vía useMemo (sin lanzar).
  const kpi = useMemo(() => resumenKPI(clientes, suscripciones), [clientes, suscripciones]);

  const clientesEnriquecidos = useMemo(() => {
    try {
      return clientes.map((c) => {
        const e = estadoMembresiaDeCliente(c.id, suscripciones);
        return { ...c, _estado: e.estado, _vencimiento: e.vencimiento };
      });
    } catch {
      // Ante cualquier cosa rara en datos, no romper el orden de hooks
      return clientes.map((c) => ({ ...c, _estado: 'vencida' as const }));
    }
  }, [clientes, suscripciones]);

  const filtrados = useMemo(() => {
    const qnorm = q.trim().toLowerCase();
    return clientesEnriquecidos.filter((c: any) => {
      const matchQ =
        qnorm.length === 0 ||
        c.nombre?.toLowerCase?.().includes(qnorm) ||
        c.correo?.toLowerCase?.().includes(qnorm) ||
        (c.telefono ?? '').toLowerCase?.().includes(qnorm);
      const matchEstado = estado === 'todos' || c._estado === estado;
      return matchQ && matchEstado;
    });
  }, [clientesEnriquecidos, q, estado]);

  // 🧪 Loading / Error se devuelven DESPUÉS de declarar hooks
  if (isLoading || subsQ.isLoading) {
    return (
      <div className="p-6">
        <Spinner label="Cargando clientes..." />
      </div>
    );
  }
  if (isError || subsQ.isError) {
    return <div className="p-6 text-rose-600">Error al cargar clientes</div>;
  }

  const isRow = (id: number) => editing?.id === id;

  return (
    <div className="space-y-4">
      {/* Título + acciones */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        {isAdmin && (
          <button className="btn" onClick={() => setOpenNew(true)}>
            Nuevo
          </button>
        )}
      </div>

      {/* KPIs */}
      <StatsBar
        items={[
          { label: 'Total', value: kpi.total },
          { label: 'Activos', value: kpi.activas },
          { label: 'Por vencer', value: kpi.porVencer },
          { label: 'Vencidos', value: kpi.vencidas },
          { label: '% Activos', value: `${kpi.activosPct}%` },
        ]}
      />

      {/* Búsqueda + filtro */}
      <SearchBar
        q={q}
        onQ={setQ}
        estado={estado}
        onEstado={setEstado}
        placeholder="Buscar por nombre, correo o teléfono…"
      />

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <div className="card p-6 text-neutral-600">No hay resultados con los filtros actuales.</div>
      ) : (
        <div className="table-wrap">
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
            <tbody className="[&>tr:nth-child(odd)]:bg-neutral-50 [&>tr:hover]:bg-forge-50/60">
              {filtrados.map((c: any) => (
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
                    <Badge kind={(c._estado as any) ?? 'default'}>
                      {(c._estado as string)?.replace?.('_', ' ')}
                    </Badge>
                    {c._vencimiento && (
                      <span className="ml-2 text-xs text-neutral-500">({c._vencimiento})</span>
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
                            onClick={() => {
                              setToDeleteId(c.id);
                              setConfirmOpen(true);
                            }}
                            disabled={del.isPending}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal "Nuevo" */}
      <ClienteFormModal open={openNew} onClose={() => setOpenNew(false)} />

      {/* Confirmación */}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar cliente"
        message="¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
        onConfirm={() => {
          if (toDeleteId != null) del.mutate(toDeleteId);
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
      />
    </div>
  );
}
