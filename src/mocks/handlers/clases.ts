import { http, HttpResponse } from 'msw';

export type Clase = {
  id: string;
  desde: string;
  hasta: string;
  entrenadores: string[];
  inscritos: { id: number; nombre: string }[];
  cupo: number;
};

function generarFranjas(): Clase[] {
  const base = new Date();
  const dia = base.toISOString().slice(0, 10); // YYYY-MM-DD
  const franjas: Clase[] = [];
  // Última franja: 21:00–23:00 => h <= 21
  for (let h = 8; h <= 21; h++) {
    const desdeH = String(h).padStart(2, '0');
    const hastaH = String(h + 2).padStart(2, '0'); // sin pasar a 24:00
    const desde = `${desdeH}:00`;
    const hasta = `${hastaH}:00`;
    const id = `${dia}_${desdeH}-00-${hastaH}-00`;

    const entrenadores =
      (h % 3 === 0) ? ['Cata P.', 'Rodrigo M.']
      : (h % 3 === 1) ? ['Javiera L.']
      : ['Marcelo V.', 'Antonia R.'];

    franjas.push({
      id,
      desde,
      hasta,
      entrenadores,
      inscritos: [],
      cupo: 20,
    });
  }
  return franjas;
}

// Estado en memoria (se regenera al refrescar)
let clasesHoy: Clase[] = generarFranjas();

export const clasesHandlers = [
  http.get('/clases', () => HttpResponse.json(clasesHoy, { status: 200 })),

  http.post('/clases/:id/inscribir', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { userId: number; nombre: string };
    const c = clasesHoy.find(c => c.id === id);
    if (!c) return HttpResponse.json({ message: 'Clase no encontrada' }, { status: 404 });
    if (c.inscritos.length >= c.cupo) {
      return HttpResponse.json({ message: 'Cupo lleno' }, { status: 409 });
    }
    if (c.inscritos.some(x => x.id === body.userId)) {
      return HttpResponse.json({ message: 'Ya inscrito' }, { status: 409 });
    }
    c.inscritos.push({ id: body.userId, nombre: body.nombre });
    return HttpResponse.json({ ok: true }, { status: 201 });
  }),
];
