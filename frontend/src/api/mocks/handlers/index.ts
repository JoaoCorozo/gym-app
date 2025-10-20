import { authHandlers } from './auth';

// Si tienes más handlers (clientes, planes, etc.), impórtalos y únelos aquí.
export const handlers = [
  ...authHandlers,
  // ...clientesHandlers,
  // ...planesHandlers,
  // ...suscripcionesHandlers,
];
