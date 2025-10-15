import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Evita warnings por recursos externos (Unsplash, etc.)
export const worker = setupWorker(...handlers);

// Si prefieres en una sola línea:
// export const worker = setupWorker(...handlers, { onUnhandledRequest: 'bypass' });
