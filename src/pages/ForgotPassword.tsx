import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { getAuthErrorMessage } from "../features/auth/authErrors"
import { sendPasswordReset } from "../services/authService"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMensaje("")
    if (!email) {
      setMensaje("Ingresá tu correo electrónico.")
      return
    }
    try {
      await sendPasswordReset(email)
      setEnviado(true)
      setMensaje("Te enviamos un email con instrucciones para restablecer tu contraseña.")
    } catch (err) {
      setMensaje(getAuthErrorMessage(err))
    }
  }

  return (
    <main className="login-page">
      <section className="login-section">
        <h1>Recuperar contraseña</h1>

        {!enviado ? (
          <form onSubmit={handleSubmit} style={{ width: "100%", display: "grid", placeItems: "center" }}>
            <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem", marginBottom: "10px" }}>
              Ingresá tu correo y te mandamos un link para elegir una nueva contraseña.
            </p>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mensaje && <span className="error" role="alert">{mensaje}</span>}
            <button type="submit">Enviar link de recuperación</button>
          </form>
        ) : (
          <p style={{ textAlign: "center", color: "#2a9d5c" }}>{mensaje}</p>
        )}

        <h3><Link to="/login">Volver a iniciar sesión</Link></h3>
      </section>
    </main>
  )
}

export default ForgotPassword
