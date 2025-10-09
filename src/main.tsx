import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js', // asegúrate que este archivo exista en /public
      },
      onUnhandledRequest: 'bypass',
    });
    console.log('%c[MSW] Mocking enabled ✅', 'color: green; font-weight: bold;');
  }
}

enableMocking().then(() => {
  const root = document.getElementById('root');
  if (!root) {
    console.error('No se encontró #root en index.html');
    return;
  }
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
