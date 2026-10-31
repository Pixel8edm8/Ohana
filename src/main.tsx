import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientID = import.meta.env
// TODO: Implement React Router
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);