import api from '../../api/axios';
import type { Cliente } from '../../types/models';

export async function fetchClientes() {
  const { data } = await api.get<Cliente[]>('/clientes');
  return data;
}

export type ClienteCreate = Omit<Cliente, 'id' | 'estadoMembresia' | 'fechaInscripcion'> & {
  estadoMembresia?: Cliente['estadoMembresia'];
  fechaInscripcion?: string;
};

export async function createCliente(payload: ClienteCreate) {
  const { data } = await api.post<Cliente>('/clientes', {
    ...payload,
    estadoMembresia: payload.estadoMembresia ?? 'activa',
    fechaInscripcion: payload.fechaInscripcion ?? new Date().toISOString().slice(0,10)
  });
  return data;
}

// 👇 NUEVO: actualizar y eliminar
export type ClienteUpdate = Partial<Omit<Cliente, 'id'>> & { id: number };

export async function updateCliente({ id, ...changes }: ClienteUpdate) {
  const { data } = await api.patch<Cliente>(`/clientes/${id}`, changes);
  return data;
}

export async function deleteCliente(id: number) {
  await api.delete(`/clientes/${id}`);
  return id;
}
