import type { SendSummaryResult } from "../types/email"
import { auth } from "./firebase"

// Endpoint de la Vercel Function (api/send-summary.ts). Es del mismo dominio que
// la app, así que no hace falta configurar CORS ni exponer ninguna URL externa.
const SUMMARY_ENDPOINT = "/api/send-summary"

// Pide al backend que envíe por email (AWS SES) el resumen de las tareas del
// usuario logueado. Se manda el ID token de Firebase para que el servidor sepa
// quién es; el destinatario lo decide el servidor, no este código.
export async function enviarResumenPorEmail(): Promise<SendSummaryResult> {
  const user = auth.currentUser
  if (!user) {
    throw new Error("Tenés que iniciar sesión para enviar el resumen.")
  }

  const idToken = await user.getIdToken()
  const res = await fetch(SUMMARY_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  })

  // Si la respuesta no es JSON (por ejemplo un error de red intermedio) no rompemos.
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "No se pudo enviar el resumen.")
  }
  return data as SendSummaryResult
}
