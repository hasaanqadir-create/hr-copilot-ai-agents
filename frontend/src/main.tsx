import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Apply theme class before paint to avoid flash
const savedTheme = localStorage.getItem('hr-copilot-theme');
const isDark = savedTheme !== 'light';
if (!isDark) document.documentElement.classList.add('light');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
