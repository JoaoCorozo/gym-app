import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlanes, createPlan, type PlanCreate } from './api';

export function usePlanes() {
  return useQuery({ queryKey: ['planes'], queryFn: fetchPlanes });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: PlanCreate) => createPlan(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planes'] }),
  });
}
