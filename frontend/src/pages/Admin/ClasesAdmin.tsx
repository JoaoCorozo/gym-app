import { useEffect, useMemo, useState } from "react";
import { getJSON, setJSON } from "../../utils/persist";
import type { Cliente } from "../../types/models";

type Inscripcion = {
  claseId: string;
  userId: string;
  nombre: string;
  fecha: string; // yyyy-mm-dd
};

const LS_INSCRIPCIONES_KEY = "clases_inscripciones_v1";

const BLOQUES = [
  { id: "funcional-8-10", rango: "08:00 - 10:00" },
  { id: "funcional-10-12", rango: "10:00 - 12:00" },
  { id: "funcional-12-14", rango: "12:00 - 14:00" },
  { id: "funcional-14-16", rango: "14:00 - 16:00" },
  { id: "funcional-16-18", rango: "16:00 - 18:00" },
  { id: "funcional-18-20", rango: "18:00 - 20:00" },
  { id: "funcional-20-22", rango: "20:00 - 22:00" },
];

const CAPACIDAD = 20;

/**
 * Helpers para leer datos de Cliente sin depender
 * de nombres exactos de campos en el tipo.
 */
function getClienteNombre(cliente: Cliente): string {
  const c: any = cliente;

  // 1) nombre directo
  if (c.nombre && typeof c.nombre === "string") return c.nombre;

  // 2) nombreCompleto
  if (c.nombreCompleto && typeof c.nombreCompleto === "string") {
    return c.nombreCompleto;
  }

  // 3) nombres + apellidos
  const partes: string[] = [];
  if (c.nombres && typeof c.nombres === "string") partes.push(c.nombres);
  if (c.apellidos && typeof c.apellidos === "string") partes.push(c.apellidos);
  const combinado = partes.join(" ").trim();
  if (combinado) return combinado;

  // 4) usar correo / email si existe
  if (c.correo && typeof c.correo === "string") return c.correo;
  if (c.email && typeof c.email === "string") return c.email;

  // 5) fallback
  return "Cliente BodyForge";
}

function getClienteEmail(cliente: Cliente): string | undefined {
  const c: any = cliente;
  if (c.email && typeof c.email === "string") return c.email;
  if (c.correo && typeof c.correo === "string") return c.correo;
  if (c.mail && typeof c.mail === "string") return c.mail;
  return undefined;
}

function getClienteId(cliente: Cliente): string {
  const c: any = cliente;
  return String(
    c.id ??
      c.uid ??
      c.rut ??
      c.documento ??
      c.correo ??
      c.email ??
      Math.random().toString(36).slice(2)
  );
}

/**
 * Busca en localStorage un array que parezca ser la lista de clientes:
 * objetos con al menos "nombre" y algún email/correo.
 */
function loadClientesFromLocalStorage(): Cliente[] {
  if (typeof window === "undefined") return [];

  try {
    const ls = window.localStorage;
    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (!key) continue;

      const raw = ls.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first: any = parsed[0];
          const tieneNombre =
            first && typeof first === "object" && "nombre" in first;
          const tieneCorreo =
            "email" in first || "correo" in first || "mail" in first;

          if (tieneNombre && tieneCorreo) {
            return parsed as Cliente[];
          }
        }
      } catch {
        // ignoramos errores de parseo
      }
    }
  } catch {
    // ignoramos errores de acceso a localStorage
  }

  return [];
}

export default function ClasesAdmin() {
  // 🔹 Inscripciones compartidas con la vista de usuario
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>(() =>
    getJSON<Inscripcion[]>(LS_INSCRIPCIONES_KEY, [])
  );

  useEffect(() => {
    setJSON(LS_INSCRIPCIONES_KEY, inscripciones);
  }, [inscripciones]);

  // 🔹 Clientes leídos desde localStorage
  const [clientes, setClientes] = useState<Cliente[]>(() =>
    loadClientesFromLocalStorage()
  );

  // Si vuelves aquí después de crear/editar clientes,
  // recargamos la lista al montar el componente.
  useEffect(() => {
    setClientes(loadClientesFromLocalStorage());
  }, []);

  // Estado del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [claseSeleccionada, setClaseSeleccionada] = useState<{
    id: string;
    rango: string;
  } | null>(null);

  const hoy = new Date().toISOString().split("T")[0];

  const inscritosPorClase = useMemo(() => {
    const map = new Map<string, Inscripcion[]>();
    for (const ins of inscripciones) {
      if (!map.has(ins.claseId)) map.set(ins.claseId, []);
      map.get(ins.claseId)!.push(ins);
    }
    return map;
  }, [inscripciones]);

  const abrirModalParaClase = (bloque: { id: string; rango: string }) => {
    setClaseSeleccionada(bloque);
    setSearch("");
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setClaseSeleccionada(null);
    setSearch("");
  };

  const handleInscribirCliente = (cliente: Cliente) => {
    if (!claseSeleccionada) return;

    const claseId = claseSeleccionada.id;
    const fecha = hoy;

    const userId = getClienteId(cliente);
    const nombreCompleto = getClienteNombre(cliente);

    // ❗ Solo una clase por día
    const yaInscritoHoy = inscripciones.some(
      (i) => i.userId === userId && i.fecha === fecha
    );
    if (yaInscritoHoy) {
      alert(`${nombreCompleto} ya está inscrito en una clase el día de hoy.`);
      return;
    }

    setInscripciones((prev) => {
      const yaEnEsaClase = prev.some(
        (i) => i.claseId === claseId && i.userId === userId
      );
      if (yaEnEsaClase) return prev;

      const ocupados = prev.filter((i) => i.claseId === claseId).length;
      if (ocupados >= CAPACIDAD) {
        alert("No quedan cupos disponibles para este bloque.");
        return prev;
      }

      return [
        ...prev,
        {
          claseId,
          userId,
          nombre: nombreCompleto,
          fecha,
        },
      ];
    });
  };

  const handleEliminar = (claseId: string, userId: string) => {
    setInscripciones((prev) =>
      prev.filter((i) => !(i.claseId === claseId && i.userId === userId))
    );
  };

  // 🔍 Búsqueda genérica: por cualquier dato (nombre, correo, etc.)
  const clientesFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;

    return clientes.filter((c) => {
      try {
        const texto = JSON.stringify(c).toLowerCase();
        return texto.includes(q);
      } catch {
        return false;
      }
    });
  }, [clientes, search]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-forge-700 text-center md:text-left">
          Administración de Clases
        </h1>
        <p className="text-neutral-700 max-w-2xl">
          Asigna clientes a clases de entrenamiento funcional. Cada cliente solo
          puede asistir a una clase por día.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOQUES.map((b) => {
          const inscritos = inscritosPorClase.get(b.id) ?? [];
          const ocupados = inscritos.length;
          const disponibles = Math.max(CAPACIDAD - ocupados, 0);

          return (
            <div
              key={b.id}
              className="card p-5 border border-neutral-200 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-neutral-900">
                  {b.rango}
                </h3>
                <p className="text-sm text-neutral-600">
                  Entrenamiento Funcional — Capacidad {CAPACIDAD} personas
                </p>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-800">
                      Inscritos: {ocupados} / {CAPACIDAD}
                    </span>
                    <span
                      className={
                        "px-2 py-0.5 rounded-full text-xs font-semibold " +
                        (disponibles === 0
                          ? "bg-rose-100 text-rose-700"
                          : ocupados === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {disponibles === 0
                        ? "Sin cupos"
                        : `${disponibles} libres`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  className="btn w-full"
                  onClick={() => abrirModalParaClase(b)}
                  disabled={disponibles === 0}
                >
                  Agregar cliente
                </button>

                <div className="border-t border-neutral-200 pt-3 text-sm text-neutral-700 text-left">
                  <div className="font-semibold mb-1">
                    Clientes inscritos ({inscritos.length}):
                  </div>
                  {inscritos.length === 0 && (
                    <div className="text-neutral-400">
                      No hay inscritos aún en este bloque.
                    </div>
                  )}
                  {inscritos.length > 0 && (
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                      {inscritos.map((i) => (
                        <li
                          key={`${i.claseId}-${i.userId}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <span>{i.nombre}</span>
                          <button
                            className="text-rose-600 hover:underline text-xs"
                            onClick={() => handleEliminar(i.claseId, i.userId)}
                          >
                            Eliminar
                          </button>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900">
                {claseSeleccionada
                  ? `Inscribir cliente en ${claseSeleccionada.rango}`
                  : "Inscribir cliente"}
              </h2>
              <button
                className="text-neutral-400 hover:text-neutral-600 text-xl"
                onClick={cerrarModal}
              >
                ×
              </button>
            </div>

            <input
              className="input w-full mb-3"
              placeholder="Buscar por cualquier dato (nombre, correo, etc.)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {clientesFiltrados.length === 0 ? (
              <div className="text-sm text-neutral-400">
                No se encontraron clientes.
              </div>
            ) : (
              <ul className="space-y-1 max-h-64 overflow-y-auto text-sm border border-neutral-100 rounded-lg p-2">
                {clientesFiltrados.map((c) => {
                  const nombre = getClienteNombre(c);
                  const correo = getClienteEmail(c) ?? "Sin email registrado";
                  return (
                    <li
                      key={getClienteId(c)}
                      className="flex items-center justify-between gap-2 py-1 px-1 rounded hover:bg-neutral-50"
                    >
                      <div>
                        <div className="font-medium">{nombre}</div>
                        <div className="text-xs text-neutral-500">
                          {correo}
                        </div>
                      </div>
                      <button
                        className="btn-ghost text-xs"
                        onClick={() => handleInscribirCliente(c)}
                      >
                        Inscribir
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="pt-4 flex justify-end">
              <button className="btn-ghost" onClick={cerrarModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
