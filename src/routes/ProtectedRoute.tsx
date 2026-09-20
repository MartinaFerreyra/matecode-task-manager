import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import useAuth from "../hooks/useAuth"

// Protege las pantallas privadas: sin sesión no se ven las tareas, se va a /login.
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main>
        <p>Cargando...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
