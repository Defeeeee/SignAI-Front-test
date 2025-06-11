import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import AccessibilityProvider from './components/AccessibilityProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </ErrorBoundary>
  </StrictMode>
);
