import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { APP_CONFIG } from '@gracetunes/shared';
import { App } from './App';
import './index.css';

document.title = `${APP_CONFIG.name} · ${APP_CONFIG.tagline}`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
