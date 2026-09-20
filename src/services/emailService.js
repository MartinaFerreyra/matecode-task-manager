// services/emailService.js
import { auth } from "./firebase"

const SUMMARY_API_URL = import.meta.env.VITE_SUMMARY_API_URL

// Pide al backend (AWS Lambda) que envíe por email el resumen de las tareas del
// usuario logueado. Se manda el ID token de Firebase para que el servidor sepa
// quién es; el destinatario lo decide el servidor, no este código.
export async function enviarResumenPorEmail() {
    if (!SUMMARY_API_URL) {
        throw new Error("El envío de resumen no está configurado.")
    }
    const user = auth.currentUser
    if (!user) {
        throw new Error("Tenés que iniciar sesión para enviar el resumen.")
    }

    const idToken = await user.getIdToken()
    const res = await fetch(SUMMARY_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
    })

    // Si la respuesta no es JSON (por ejemplo un error de red intermedio) no rompemos.
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar el resumen.")
    }
    return data
}
