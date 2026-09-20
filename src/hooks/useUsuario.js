// hooks/useUsuario.js
import { useEffect, useState } from "react"
import { onChangeUser } from "../services/firebase"

const useUsuario = () => {
    const [usuario, setUsuario] = useState(undefined)
    // undefined = todavía no sabemos si hay sesión (Firebase está resolviendo)
    // null      = Firebase ya resolvió: NO hay usuario logueado
    // objeto    = Firebase ya resolvió: SÍ hay usuario logueado

    useEffect(() => {
        onChangeUser(setUsuario)
    }, [])

    const cargando = usuario === undefined

    return { usuario, cargando }
}

export default useUsuario