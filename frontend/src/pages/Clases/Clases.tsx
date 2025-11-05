import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getJSON, setJSON } from '../../utils/persist';

type Clase = {
  id: string;
  nombre: string;
  entrenador: string;
  inicio: string;
  fin: string;
  capacidad?: number;
};

type Inscripcion = {
  claseId: string;
  userId: string;
  nombre: string;
  fecha: string; // yyyy-mm-dd
};

const LS_KEY = 'clases_inscripciones_v1';

type BloqueHora = { inicio: number; fin: number };

const BLOQUES: BloqueHora[] = [
  { inicio: 8, fin: 10 },
  { inicio: 10, fin: 12 },
  { inicio: 12, fin: 14 },
  { inicio: 14, fin: 16 },
  { inicio: 16, fin: 18 },
  { inicio: 18, fin: 20 },
  { inicio: 20, fin: 22 },
];

const ENTRENADORES = [
  'Carlos Díaz',
  'Ana Torres',
  'Luis Romero',
  'María González',
];

function generarClasesDelDia(): Clase[] {
  const hoy = new Date();
  return BLOQUES.map((b, idx) => {
    const inicio = new Date(hoy);
    inicio.setHours(b.inicio, 0, 0, 0);
    const fin = new Date(hoy);
    fin.setHours(b.fin, 0, 0, 0);

    const entrenador = ENTRENADORES[idx % ENTRENADORES.length];

    return {
      id: `funcional-${b.inicio}-${b.fin}`,
      nombre: 'Entrenamiento Funcional',
      entrenador,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      capacidad: 20,
    };
  });
}

function parseDate(value: string) {
  return new Date(value);
}

export default function Clases() {
  const { user } = useAuth();

  const clases: Clase[] = useMemo(() => generarClasesDelDia(), []);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>(
    () => getJSON<Inscripcion[]>(LS_KEY, [])
  );

  useEffect(() => {
    setJSON(LS_KEY, inscripciones);
  }, [inscripciones]);

  const clasesConInscritos = useMemo(() => {
    return clases.map((clase) => {
      const capacidad = clase.capacidad ?? 20;
      const inscritos = inscripciones.filter((i) => i.claseId === clase.id);
      const ocupados = inscritos.length;
      const disponibles = Math.max(capacidad - ocupados, 0);
      return {
        ...clase,
        capacidad,
        inscritos,
        ocupados,
        disponibles,
      };
    });
  }, [clases, inscripciones]);

  const handleInscribir = (claseId: string, fechaClase: string) => {
    if (!user) {
      alert('Debes iniciar sesión para inscribirte en una clase.');
      return;
    }

    const userId = String(
      (user as any).id ?? (user as any).sub ?? (user as any).email
    );
    const nombre =
      (user as any).nombre ??
      (user as any).name ??
      (user as any).email ??
      'Cliente BodyForge';

    // Regla: solo una clase por día
    const yaInscritoHoy = inscripciones.some(
      (i) => i.userId === userId && i.fecha === fechaClase
    );
    if (yaInscritoHoy) {
      alert('Solo puedes inscribirte en una clase por día.');
      return;
    }

    setInscripciones((prev) => {
      const yaInscrito = prev.some(
        (i) => i.claseId === claseId && i.userId === userId
      );
      if (yaInscrito) return prev;

      const capacidad = 20;
      const ocupados = prev.filter((i) => i.claseId === claseId).length;
      if (ocupados >= capacidad) {
        alert('No quedan cupos disponibles para esta clase.');
        return prev;
      }

      return [
        ...prev,
        {
          claseId,
          userId,
          nombre,
          fecha: fechaClase,
        },
      ];
    });
  };

  const handleCancelar = (claseId: string) => {
    if (!user) return;
    const userId = String(
      (user as any).id ?? (user as any).sub ?? (user as any).email
    );

    setInscripciones((prev) =>
      prev.filter((i) => !(i.claseId === claseId && i.userId === userId))
    );
  };

  return (
    <div className="space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-forge-700">
          Clases de Entrenamiento Funcional
        </h1>
        <p className="text-neutral-700 max-w-2xl mx-auto">
          Solo puedes tomar una clase por día. Cada bloque tiene 20 cupos disponibles.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clasesConInscritos.map((clase) => {
          const inicio = parseDate(clase.inicio);
          const fin = parseDate(clase.fin);
          const fechaClase = inicio.toISOString().split('T')[0];
          const hora = `${inicio.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
          })} - ${fin.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
          })}`;

          const userId = user
            ? String(
                (user as any).id ??
                  (user as any).sub ??
                  (user as any).email
              )
            : null;

          const yaInscrito =
            !!userId &&
            clase.inscritos.some((i) => i.userId === userId);

          const lleno = clase.disponibles === 0;

          return (
            <div
              key={clase.id}
              className="card p-5 flex flex-col justify-between h-full border border-neutral-200 bg-white rounded-2xl shadow-sm"
            >
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-forge-500 font-semibold">
                  {hora}
                </div>
                <h2 className="text-lg font-bold text-neutral-900">
                  {clase.nombre}
                </h2>
                <p className="text-sm text-neutral-600">
                  Entrenador:{' '}
                  <span className="font-medium">{clase.entrenador}</span>
                </p>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-800">
                      Cupos: {clase.ocupados} / {clase.capacidad}
                    </span>
                    <span
                      className={
                        'px-2 py-0.5 rounded-full text-xs font-semibold ' +
                        (lleno
                          ? 'bg-rose-100 text-rose-700'
                          : clase.ocupados > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700')
                      }
                    >
                      {lleno
                        ? 'Sin cupos'
                        : clase.ocupados === 0
                        ? 'Disponible'
                        : `${clase.disponibles} libres`}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forge-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (clase.ocupados / clase.capacidad) * 100
                        ).toFixed(0)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  className={
                    'btn w-full ' +
                    (lleno && !yaInscrito
                      ? 'opacity-60 cursor-not-allowed'
                      : '')
                  }
                  onClick={() =>
                    yaInscrito
                      ? handleCancelar(clase.id)
                      : handleInscribir(clase.id, fechaClase)
                  }
                  disabled={lleno && !yaInscrito}
                >
                  {yaInscrito
                    ? 'Cancelar inscripción'
                    : 'Inscribirme en esta clase'}
                </button>

                <div className="border-t border-neutral-200 pt-3 text-sm text-neutral-700 text-left">
                  <div className="font-semibold mb-1">
                    Personas inscritas ({clase.inscritos.length}):
                  </div>
                  {clase.inscritos.length === 0 && (
                    <div className="text-neutral-400">
                      Aún no hay inscritos en esta clase.
                    </div>
                  )}
                  {clase.inscritos.length > 0 && (
                    <ul className="space-y-1 max-h-32 overflow-y-auto">
                      {clase.inscritos.map((i) => (
                        <li
                          key={`${i.claseId}-${i.userId}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="font-medium">{i.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
