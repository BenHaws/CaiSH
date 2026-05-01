import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

// Suppress benign ResizeObserver error
window.addEventListener('error', (e) => {
  if (e.message.includes('ResizeObserver loop completed with undelivered notifications.') || 
      e.message.includes('ResizeObserver loop limit exceeded')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && (
    e.reason.message?.includes('ResizeObserver loop completed with undelivered notifications.') || 
    e.reason.message?.includes('ResizeObserver loop limit exceeded')
  )) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const root = document.getElementById('root')!;
root.dataset.reactMounted = 'true';

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
