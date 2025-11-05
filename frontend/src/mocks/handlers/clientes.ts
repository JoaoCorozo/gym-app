import { http, HttpResponse } from "msw";

// Datos falsos de ejemplo (puedes cambiarlos libremente)
const clientesMock = [
  {
    id: "1",
    nombre: "Ana",
    apellido: "Pérez",
    email: "ana@mail.com",
    telefono: "91234",
    fechaInscripcion: "2025-01-15",
    estadoMembresia: "activa",
    planId: 1,
  },
  {
    id: "2",
    nombre: "Luis",
    apellido: "Soto",
    email: "luis@mail.com",
    telefono: "98765",
    fechaInscripcion: "2025-03-02",
    estadoMembresia: "morosa",
    planId: 2,
  },
  {
    id: "3",
    nombre: "Carla",
    apellido: "Fuentes",
    email: "carla@mail.com",
    telefono: "95432",
    fechaInscripcion: "2025-04-10",
    estadoMembresia: "activa",
    planId: 1,
  },
];

// Handlers del endpoint de clientes
export const clientesHandlers = [
  // Obtener todos los clientes
  http.get("/clientes", () => {
    return HttpResponse.json(clientesMock, { status: 200 });
  }),

  // Obtener un cliente por ID
  http.get("/clientes/:id", ({ params }) => {
    const cliente = clientesMock.find((c) => c.id === params.id);
    if (!cliente) {
      return HttpResponse.json({ message: "Cliente no encontrado" }, { status: 404 });
    }
    return HttpResponse.json(cliente, { status: 200 });
  }),
];
