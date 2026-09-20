import type { VercelRequest, VercelResponse } from "@vercel/node"
import { verifyFirebaseToken, type FirebaseUser } from "./_lib/auth.js"
import { fetchUserTasks, registerSend } from "./_lib/firestore.js"
import { sendEmail } from "./_lib/ses.js"
import { buildSummary } from "./_lib/summary.js"

// POST /api/send-summary
// Envía por email (AWS SES) el resumen de las tareas del usuario logueado.
// Requiere el header "Authorization: Bearer <ID token de Firebase>".
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")

  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) {
    console.error("Falta la variable de entorno FIREBASE_PROJECT_ID")
    return res.status(500).json({ error: "El servicio no está configurado." })
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Método no permitido." })
  }

  // 1. Autenticación: el destinatario sale del token, nunca del cliente.
  const idToken = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1]
  if (!idToken) {
    return res.status(401).json({ error: "Tenés que iniciar sesión para enviar el resumen." })
  }

  let user: FirebaseUser
  try {
    user = await verifyFirebaseToken(idToken, projectId)
  } catch (err) {
    console.warn("Token inválido", err)
    return res.status(401).json({ error: "Tu sesión no es válida. Volvé a iniciar sesión." })
  }

  try {
    // 2. Límite de un envío por minuto (lo hacen cumplir las reglas de Firestore).
    if (!(await registerSend(projectId, idToken, user.uid))) {
      return res.status(429).json({ error: "Ya enviaste un resumen hace poco. Esperá un minuto e intentá de nuevo." })
    }

    // 3. Tareas del usuario y armado del resumen.
    const tasks = await fetchUserTasks(projectId, idToken, user.uid)
    const summary = buildSummary(tasks, user.name ?? user.email)

    // 4. Envío con SES.
    await sendEmail({ to: user.email, subject: summary.subject, text: summary.text, html: summary.html })

    return res.status(200).json({ ok: true, total: summary.total, pending: summary.pending, completed: summary.completed })
  } catch (err) {
    // El detalle (por ejemplo MessageRejected en sandbox) queda solo en los logs de Vercel.
    console.error("Error al enviar el resumen", err)
    return res.status(500).json({ error: "No se pudo enviar el email. Intentá de nuevo más tarde." })
  }
}
