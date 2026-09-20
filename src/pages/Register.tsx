import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import PasswordInput from "../components/PasswordInput"
import { getAuthErrorMessage } from "../features/auth/authErrors"
import { loginWithGoogle, registerWithEmail } from "../services/authService"
import { validarPassword } from "../utils/validations"

// Si el registro sale bien, Firebase abre la sesión y PublicRoute redirige a /tasks.
function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Ingresá tu correo y una contraseña.")
      return
    }
    // El formato de la contraseña se valida solo al registrarse.
    const errorPassword = validarPassword(password)
    if (errorPassword) {
      setError(errorPassword)
      return
    }
    try {
      await registerWithEmail(email, password)
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
        <h1>Crear cuenta</h1>
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "grid", placeItems: "center" }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput value={password} onChange={setPassword} />

          {error && <span className="error" role="alert">{error}</span>}

          <button type="submit">Registrarse</button>
        </form>
        <h3>ó</h3>
        <button type="button" onClick={handleGoogle}>Registrarse con Google</button>
        <h3>¿Ya tienes cuenta? <Link to="/login">Iniciar Sesion</Link></h3>
      </section>
    </main>
  )
}

export default Register
