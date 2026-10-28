import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { googleFontsHref, THEMES } from '@gracetunes/shared';
import { App } from './App';
import './index.css';

// Load every theme's fonts so previews render with the real typefaces.
for (const theme of THEMES) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = googleFontsHref(theme);
  document.head.appendChild(link);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
