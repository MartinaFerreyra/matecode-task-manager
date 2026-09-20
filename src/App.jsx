// App.jsx
import './App.css'
import { loginGoogle, loginUsuario, registroUsuario } from './services/firebase'
import { validarPassword } from './utils/validations'
import useUsuario from './hooks/useUsuario.js'
import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'

function App() {
  const { usuario, cargando } = useUsuario()
  const [isLogin, setIsLogin] = useState(true)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', error: '' })

  if (!cargando && usuario) {
    return <Navigate to="/tasks" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormData({ ...formData, error: '' })

    if (!isLogin) {
      // Solo validamos formato de contraseña al REGISTRARSE,
      // no al iniciar sesión (ahí Firebase ya valida contra lo guardado).
      const errorPassword = validarPassword(formData.password)
      if (errorPassword) {
        setFormData({ ...formData, error: errorPassword })
        return
      }
    }

    if (isLogin) {
      loginUsuario(formData, setFormData)
    } else {
      registroUsuario(formData, setFormData)
    }
  }

  return (
    <main className="login-page">
      <section className="login-section">
        <h1>Task Manager</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'grid', placeItems: 'center' }}>
          <input type="email" placeholder='Correo electrónico' value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

          <div className="password-field">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              placeholder='Contraseña'
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.8 21.8 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.8 21.8 0 01-3.22 4.53M14.12 14.12a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {formData.error && <span className='error'>{formData.error}</span>}

          <button type="submit">{isLogin ? 'Iniciar Sesion' : 'Registrarse'}</button>

          {isLogin && (
            <Link to="/forgot-password" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </Link>
          )}
        </form>
        <h3>ó</h3>
        <button onClick={loginGoogle}>{isLogin ? "Iniciar sesión con Google" : "Registrarse con Google"}</button>
        {isLogin
          ? <h3>¿No tienes cuenta?<span onClick={() => setIsLogin(!isLogin)}> Crea una</span></h3>
          : <h3>¿Ya tienes cuenta?<span onClick={() => setIsLogin(!isLogin)}> Iniciar Sesion </span></h3>}
      </section>
    </main>
  )
}

export default App