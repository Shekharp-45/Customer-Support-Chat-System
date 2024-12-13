import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router  } from "react-router-dom";
import './index.css';
import App from './App.tsx';
import reportWebVitals from './reportWebVitals';
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}
ReactDOM.createRoot(rootElement).render(
  <StrictMode>
  <Router>
    <App />
  </Router>
  </StrictMode>
);
reportWebVitals();
