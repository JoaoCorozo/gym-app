import { http, HttpResponse } from 'msw';

export type PlanMock = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
};

let planes: PlanMock[] = [
  { id: 1, nombre: 'Mensual',    descripcion: 'Acceso ilimitado por 30 días',  precio: 30000,  duracionDias: 30 },
  { id: 2, nombre: 'Trimestral', descripcion: 'Acceso ilimitado por 90 días',  precio: 80000,  duracionDias: 90 },
  { id: 3, nombre: 'Anual',      descripcion: 'Acceso ilimitado por 365 días', precio: 250000, duracionDias: 365 },
];

export const planesHandlers = [
  http.get('/planes', () => HttpResponse.json(planes, { status: 200 })),
];
