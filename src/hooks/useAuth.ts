import { useEffect, useState } from "react"
import { onAuthChange } from "../services/authService"
import type { AppUser } from "../types/auth"

export default function useAuth() {
  // undefined = todavía no sabemos si hay sesión (Firebase está resolviendo)
  // null      = Firebase ya resolvió: NO hay usuario logueado
  // objeto    = Firebase ya resolvió: SÍ hay usuario logueado
  const [user, setUser] = useState<AppUser | null | undefined>(undefined)

  // onAuthChange devuelve el unsubscribe: al devolverlo aquí se cancela al desmontar.
  useEffect(() => onAuthChange(setUser), [])

  return { user: user ?? null, loading: user === undefined }
}
