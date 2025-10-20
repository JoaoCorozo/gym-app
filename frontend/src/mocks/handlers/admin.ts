import { http, HttpResponse } from 'msw';

export type Cliente = {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
};

export type Plan = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
};

export type Suscripcion = {
  id: number;
  clienteId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
};

let clientes: Cliente[] = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@gym.cl', telefono: '987654321' },
  { id: 2, nombre: 'María López', email: 'maria@gym.cl', telefono: '912345678' },
];

let planes: Plan[] = [
  { id: 1, nombre: 'Mensual', descripcion: 'Acceso ilimitado 30 días', precio: 30000, duracionDias: 30 },
  { id: 2, nombre: 'Trimestral', descripcion: 'Acceso ilimitado 90 días', precio: 80000, duracionDias: 90 },
  { id: 3, nombre: 'Anual', descripcion: 'Acceso ilimitado 365 días', precio: 250000, duracionDias: 365 },
];

let suscripciones: Suscripcion[] = [];

let seqCliente = 3;
let seqSuscripcion = 1;

/* CLIENTES CRUD */
export const adminHandlers = [
  http.get('/clientes', () => HttpResponse.json(clientes)),

  http.post('/clientes', async ({ request }) => {
    const body = await request.json() as Cliente;
    const nuevo = { ...body, id: seqCliente++ };
    clientes.push(nuevo);
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  http.put('/clientes/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Cliente;
    const idx = clientes.findIndex(c => c.id === Number(id));
    if (idx === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    clientes[idx] = { ...body, id: Number(id) };
    return HttpResponse.json(clientes[idx]);
  }),

  http.delete('/clientes/:id', ({ params }) => {
    const { id } = params;
    clientes = clientes.filter(c => c.id !== Number(id));
    return HttpResponse.json({ ok: true });
  }),

  /* PLANES CRUD */
  http.get('/planes', () => HttpResponse.json(planes)),
  http.post('/planes', async ({ request }) => {
    const body = await request.json() as Plan;
    const nuevo = { ...body, id: planes.length + 1 };
    planes.push(nuevo);
    return HttpResponse.json(nuevo, { status: 201 });
  }),
  http.put('/planes/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Plan;
    const idx = planes.findIndex(p => p.id === Number(id));
    if (idx === -1) return HttpResponse.json({ message: 'No encontrado' }, { status: 404 });
    planes[idx] = { ...body, id: Number(id) };
    return HttpResponse.json(planes[idx]);
  }),
  http.delete('/planes/:id', ({ params }) => {
    const { id } = params;
    planes = planes.filter(p => p.id !== Number(id));
    return HttpResponse.json({ ok: true });
  }),

  /* SUSCRIPCIONES CRUD */
  http.get('/suscripciones', () => HttpResponse.json(suscripciones)),

  http.post('/suscripciones', async ({ request }) => {
    const body = await request.json() as Omit<Suscripcion, 'id'>;
    const nuevo = { ...body, id: seqSuscripcion++ };
    suscripciones.push(nuevo);
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  http.delete('/suscripciones/:id', ({ params }) => {
    const { id } = params;
    suscripciones = suscripciones.filter(s => s.id !== Number(id));
    return HttpResponse.json({ ok: true });
  }),
];
