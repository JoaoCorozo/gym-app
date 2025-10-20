import api from '../../api/axios';
import type { Suscripcion, Plan } from '../../types/models';

export async function fetchSuscripciones() {
  const { data } = await api.get<Suscripcion[]>('/suscripciones');
  return data;
}
export async function fetchPlanes() {
  const { data } = await api.get<Plan[]>('/planes');
  return data;
}
export type SuscripcionCreate = Omit<Suscripcion, 'id'|'fechaVencimiento'> & { fechaVencimiento?: string };

export async function createSuscripcion(payload: SuscripcionCreate) {
  const { data } = await api.post<Suscripcion>('/suscripciones', payload);
  return data;
}
