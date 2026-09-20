import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import PasswordInput from "../components/PasswordInput"
import { getAuthErrorMessage } from "../features/auth/authErrors"
import { loginWithEmail, loginWithGoogle } from "../services/authService"

// Si el login sale bien, PublicRoute detecta la sesión y redirige a /tasks.
function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Ingresá tu correo y tu contraseña.")
      return
    }
    try {
      await loginWithEmail(email, password)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
  }

  const handleGoogle = async () => {
    setError("")
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
  }

  return (
    <main className="login-page">
      <section className="login-section">
        <h1>Task Manager</h1>
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "grid", placeItems: "center" }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput value={password} onChange={setPassword} />

          {error && <span className="error" role="alert">{error}</span>}

          <button type="submit">Iniciar Sesion</button>

          <Link to="/forgot-password" className="forgot-password-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
        <h3>ó</h3>
        <button type="button" onClick={handleGoogle}>Iniciar sesión con Google</button>
        <h3>¿No tienes cuenta? <Link to="/register">Crea una</Link></h3>
      </section>
    </main>
  )
}

export default Login
