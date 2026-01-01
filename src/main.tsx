import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { WorldPage } from './pages/WorldPage';
import './index.css';
import { initGA } from './lib/analytics';
import './lib/i18n'; // Initialize i18n

// Initialize Google Analytics
initGA();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/world" element={<WorldPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
