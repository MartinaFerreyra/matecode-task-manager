import { useState } from "react"
import { logout } from "../services/authService"

interface UserMenuProps {
  nombre?: string
  foto?: string | null
}

function UserMenu({ nombre, foto }: UserMenuProps) {
  const [abierto, setAbierto] = useState(false)
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : "?"

  return (
    <div className="user-menu">
      <button onClick={() => setAbierto(!abierto)} className="user-menu-trigger">
        {foto
          ? <img src={foto} alt="Avatar" className="user-avatar" />
          : <span className="user-avatar user-avatar-fallback">{inicial}</span>
        }
        <span>{nombre}</span>
        <span className="user-menu-arrow">▾</span>
      </button>
      {abierto && (
        <div className="user-menu-dropdown">
          <button onClick={() => logout().catch((err) => console.error("Error al cerrar sesión:", err))}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
