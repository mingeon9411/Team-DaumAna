import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

let scrollTimer = null;
window.addEventListener('scroll', () => {
  document.body.classList.add('is-scrolling');
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    document.body.classList.remove('is-scrolling');
  }, 800);

}, { passive: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
