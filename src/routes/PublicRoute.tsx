import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import useAuth from "../hooks/useAuth"

// Para las pantallas de login y registro: si ya hay sesión, se va directo a /tasks.
function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main>
        <p>Cargando...</p>
      </main>
    )
  }

  if (user) {
    return <Navigate to="/tasks" replace />
  }

  return children
}

export default PublicRoute
