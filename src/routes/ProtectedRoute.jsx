// routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"
import useUsuario from "../hooks/useUsuario"

function ProtectedRoute({ children }) {
    const { usuario, cargando } = useUsuario()

    if (cargando) {
        return (
            <main>
                <p>Cargando...</p>
            </main>
        )
    }

    if (!usuario) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute