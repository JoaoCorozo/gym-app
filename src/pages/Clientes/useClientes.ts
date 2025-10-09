import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type ClienteCreate,
  type ClienteUpdate,
} from './api';

export function useClientes() {
  return useQuery({ queryKey: ['clientes'], queryFn: fetchClientes });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClienteCreate) => createCliente(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

// 👇 NUEVOS
export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClienteUpdate) => updateCliente(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
    // Optimistic update (suaviza UI):
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['clientes'] });
      const prev = qc.getQueryData<any>(['clientes']);
      qc.setQueryData<any>(['clientes'], (old: any[] = []) => old.filter(c => c.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => { if (ctx?.prev) qc.setQueryData(['clientes'], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}
