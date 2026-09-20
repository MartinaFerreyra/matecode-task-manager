import { useCallback, useState } from "react"
import { enviarResumenPorEmail } from "../services/emailService"
import type { SendSummaryStatus } from "../types/email"

// Maneja el estado del botón "Enviar resumen por email":
// idle -> enviando -> ok | error (con un mensaje listo para mostrar).
export default function useSendSummary(email: string | null | undefined) {
  const [status, setStatus] = useState<SendSummaryStatus>("idle")
  const [message, setMessage] = useState("")

  const send = useCallback(async () => {
    setStatus("enviando")
    setMessage("")
    try {
      await enviarResumenPorEmail()
      setStatus("ok")
      setMessage(`Te enviamos el resumen a ${email}.`)
    } catch (err) {
      console.error("Error al enviar el resumen:", err)
      setStatus("error")
      // El backend devuelve mensajes pensados para el usuario.
      setMessage(err instanceof Error && err.message ? err.message : "No se pudo enviar el resumen.")
    }
  }, [email])

  return { status, message, send }
}
