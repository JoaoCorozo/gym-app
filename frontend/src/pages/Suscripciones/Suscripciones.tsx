import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { getJSON, setJSON } from '../../utils/persist';

type Cliente = { id: number; nombre: string; email: string };
type Plan = { id: number; nombre: string; duracionDias: number };
type Suscripcion = {
  id: number;
  clienteId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
};

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x;
  if (x?.items && Array.isArray(x.items)) return x.items;
  if (x?.data && Array.isArray(x.data)) return x.data;
  return [];
}
function looksLikeHTML(x: any) {
  return typeof x === 'string' && x.startsWith('<!doctype html');
}

const LS_CLIENTES = 'admin_clientes';
const LS_PLANES = 'admin_planes';
const LS_SUS = 'admin_suscripciones';
const LS_SEQ = 'admin_seq_suscripciones';

export default function Suscripciones() {
  const qc = useQueryClient();

  // Estados locales con persistencia
  const [localClientes] = useState<Cliente[]>(
    getJSON<Cliente[]>(LS_CLIENTES, [
      { id: 1, nombre: 'Juan Pérez', email: 'juan@gym.cl' },
      { id: 2, nombre: 'María López', email: 'maria@gym.cl' },
    ])
  );
  const [localPlanes] = useState<Plan[]>(
    getJSON<Plan[]>(LS_PLANES, [
      { id: 1, nombre: 'Mensual', duracionDias: 30 },
      { id: 2, nombre: 'Trimestral', duracionDias: 90 },
      { id: 3, nombre: 'Anual', duracionDias: 365 },
    ])
  );
  const [localSus, setLocalSus] = useState<Suscripcion[]>(
    getJSON<Suscripcion[]>(LS_SUS, [])
  );
  const [seq, setSeq] = useState<number>(getJSON<number>(LS_SEQ, (localSus.at(-1)?.id ?? 0) + 1));

  // Persistir cambios de suscripciones locales
  useEffect(() => {
    setJSON(LS_SUS, localSus);
    setJSON(LS_SEQ, seq);
  }, [localSus, seq]);

  // Queries remotas (si API existe)
  const qClientes = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => (await api.get('/clientes')).data,
    retry: 0,
  });
  const qPlanes = useQuery({
    queryKey: ['planes-admin'],
    queryFn: async () => (await api.get('/planes')).data,
    retry: 0,
  });
  const qSus = useQuery({
    queryKey: ['suscripciones'],
    queryFn: async () => (await api.get('/suscripciones')).data,
    retry: 0,
  });

  const inMockClientes = useMemo(() => qClientes.isError || looksLikeHTML(qClientes.data), [qClientes.isError, qClientes.data]);
  const inMockPlanes   = useMemo(() => qPlanes.isError   || looksLikeHTML(qPlanes.data),   [qPlanes.isError, qPlanes.data]);
  const inMockSus      = useMemo(() => qSus.isError      || looksLikeHTML(qSus.data),      [qSus.isError, qSus.data]);

  const clientes = inMockClientes ? localClientes : asArray<Cliente>(qClientes.data);
  const planes   = inMockPlanes   ? localPlanes   : asArray<Plan>(qPlanes.data);
  const sus      = inMockSus      ? localSus      : asArray<Suscripcion>(qSus.data);

  const crear = useMutation({
    mutationFn: async (payload: Omit<Suscripcion, 'id'>) => (await api.post('/suscripciones', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suscripciones'] }),
  });
  const eliminar = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/suscripciones/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suscripciones'] }),
  });

  const [form, setForm] = useState<{ clienteId: number | ''; planId: number | ''; fechaInicio: string }>({
    clienteId: '',
    planId: '',
    fechaInicio: '',
  });

  const fechaFin = useMemo(() => {
    if (!form.fechaInicio || !form.planId) return '';
    const plan = planes.find(p => p.id === form.planId);
    if (!plan) return '';
    const start = new Date(form.fechaInicio);
    const fin = new Date(start);
    fin.setDate(start.getDate() + plan.duracionDias);
    return fin.toISOString().slice(0, 10);
  }, [form.fechaInicio, form.planId, planes]);

  if (qClientes.isLoading || qPlanes.isLoading || qSus.isLoading) return <div className="p-6">Cargando…</div>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.planId || !form.fechaInicio) return;

    const payload = {
      clienteId: Number(form.clienteId),
      planId: Number(form.planId),
      fechaInicio: form.fechaInicio,
      fechaFin: fechaFin || form.fechaInicio,
    };

    if (inMockSus) {
      setLocalSus(arr => [...arr, { ...payload, id: seq }]);
      setSeq(n => n + 1);
      setForm({ clienteId: '', planId: '', fechaInicio: '' });
      return;
    }

    await crear.mutateAsync(payload);
    setForm({ clienteId: '', planId: '', fechaInicio: '' });
  };

  const onDelete = async (id: number) => {
    if (inMockSus) {
      setLocalSus(arr => arr.filter(s => s.id !== id));
      return;
    }
    await eliminar.mutateAsync(id);
  };

  const getNombreCliente = (id: number) => clientes.find(c => c.id === id)?.nombre ?? `#${id}`;
  const getNombrePlan = (id: number) => planes.find(p => p.id === id)?.nombre ?? `#${id}`;

  return (
    <div className="space-y-6">
      {(inMockClientes || inMockPlanes || inMockSus) && (
        <div className="p-3 rounded-xl2 bg-amber-50 border border-amber-200 text-amber-800">
          Modo local con persistencia: datos guardados en este navegador.
        </div>
      )}

      <h1 className="text-2xl font-bold">Suscripciones</h1>

      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Crear suscripción</h2>
        <form className="grid md:grid-cols-4 gap-4 items-end" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Cliente</label>
            <select className="input mt-1" value={form.clienteId}
              onChange={(e) => setForm(f => ({ ...f, clienteId: Number(e.target.value) || '' }))}>
              <option value="">Selecciona cliente…</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Plan</label>
            <select className="input mt-1" value={form.planId}
              onChange={(e) => setForm(f => ({ ...f, planId: Number(e.target.value) || '' }))}>
              <option value="">Selecciona plan…</option>
              {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Fecha inicio</label>
            <input type="date" className="input mt-1" value={form.fechaInicio}
              onChange={(e) => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Fecha fin</label>
            <input type="date" className="input mt-1" value={fechaFin} readOnly />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button className="btn" type="submit">Crear</button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl2 border border-neutral-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Cliente</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Plan</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Inicio</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-700">Fin</th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sus.map(s => (
              <tr key={s.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3">{getNombreCliente(s.clienteId)}</td>
                <td className="px-4 py-3">{getNombrePlan(s.planId)}</td>
                <td className="px-4 py-3">{s.fechaInicio}</td>
                <td className="px-4 py-3">{s.fechaFin}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="btn-outline text-rose-700 border-rose-300 hover:bg-rose-50"
                    onClick={() => onDelete(s.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {sus.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">No hay suscripciones aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
