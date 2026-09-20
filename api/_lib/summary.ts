// Arma el contenido del email de resumen. No toca AWS ni Firestore,
// así se puede testear sin credenciales.

export interface TaskData {
  title: string
  description?: string
  completed: boolean
}

export interface Summary {
  total: number
  completed: number
  pending: number
  subject: string
  text: string
  html: string
}

// Los títulos y descripciones los escribe el usuario: hay que escaparlos
// antes de meterlos en el HTML del email.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Evita que un título con saltos de línea rompa el asunto o el texto plano.
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function buildSummary(tasks: TaskData[], nombre: string): Summary {
  const completedTasks = tasks.filter((t) => t.completed)
  const pendingTasks = tasks.filter((t) => !t.completed)
  const total = tasks.length
  const saludo = oneLine(nombre) || "Hola"

  const textSection = (title: string, list: TaskData[]) =>
    list.length === 0
      ? `${title}: ninguna`
      : `${title} (${list.length}):\n${list.map((t) => `  - ${oneLine(t.title)}`).join("\n")}`

  const text = [
    `Hola ${saludo}, este es el resumen de tus tareas.`,
    "",
    `Total: ${total} | Pendientes: ${pendingTasks.length} | Completadas: ${completedTasks.length}`,
    "",
    textSection("Pendientes", pendingTasks),
    "",
    textSection("Completadas", completedTasks),
  ].join("\n")

  const htmlSection = (title: string, list: TaskData[]) =>
    list.length === 0
      ? `<h3>${title}</h3><p>Ninguna</p>`
      : `<h3>${title} (${list.length})</h3><ul>${list
          .map((t) => `<li>${escapeHtml(oneLine(t.title))}</li>`)
          .join("")}</ul>`

  const html = [
    `<p>Hola ${escapeHtml(saludo)}, este es el resumen de tus tareas.</p>`,
    `<p><strong>Total:</strong> ${total} &middot; <strong>Pendientes:</strong> ${pendingTasks.length} &middot; <strong>Completadas:</strong> ${completedTasks.length}</p>`,
    htmlSection("Pendientes", pendingTasks),
    htmlSection("Completadas", completedTasks),
  ].join("")

  return {
    total,
    completed: completedTasks.length,
    pending: pendingTasks.length,
    subject: `Resumen de tus tareas: ${pendingTasks.length} pendientes, ${completedTasks.length} completadas`,
    text,
    html,
  }
}
