import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './App.css'
import AppRoutes from './routes/AppRoutes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
      {/* AppRoutes decide qué pantalla mostrar según la ruta (/login, /register, /tasks) */}
    </BrowserRouter>
  </StrictMode>,
)
