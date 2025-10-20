import api from '../../api/axios';
import type { Plan } from '../../types/models';

export async function fetchPlanes() {
  const { data } = await api.get<Plan[]>('/planes');
  return data;
}

export type PlanCreate = Omit<Plan, 'id'>;

export async function createPlan(payload: PlanCreate) {
  const { data } = await api.post<Plan>('/planes', payload);
  return data;
}
