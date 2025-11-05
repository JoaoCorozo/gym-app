import { authHandlers } from "./auth";
import { planesHandlers } from "./planes";
import { clasesHandlers } from "./clases";
import { adminHandlers } from "./admin";
import { pagosHandlers } from "./pagos";
import { clientesHandlers } from "./clientes"; // 👈 agregado

export const handlers = [
  ...authHandlers,
  ...planesHandlers,
  ...clasesHandlers,
  ...adminHandlers,
  ...pagosHandlers,
  ...clientesHandlers, // 👈 agregado
];
