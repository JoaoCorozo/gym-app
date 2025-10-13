import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSuscripciones,
  createSuscripcion,
  fetchPlanes,
  type SuscripcionCreate,
} from './api';
import { notify } from '../../utils/toast';

export function useSuscripciones() {
  return useQuery({ queryKey: ['suscripciones'], queryFn: fetchSuscripciones });
}

export function usePlanesLite() {
  return useQuery({ queryKey: ['planes'], queryFn: fetchPlanes });
}

export function useCreateSuscripcion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: SuscripcionCreate) => createSuscripcion(s),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suscripciones'] });
      notify.success('Suscripción creada');
    },
    onError: () => notify.error('No se pudo crear la suscripción'),
  });
}
