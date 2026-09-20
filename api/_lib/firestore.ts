import type { TaskData } from "./summary.js"

// Se habla con Firestore por REST usando el ID token DEL USUARIO, no una cuenta
// de servicio: así las reglas de seguridad de Firestore siguen aplicando y esta
// Lambda no necesita ningún secreto.

const MAX_TASKS = 500

function documentsUrl(projectId: string): string {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
}

interface RunQueryItem {
  document?: {
    fields?: {
      title?: { stringValue?: string }
      description?: { stringValue?: string }
      completed?: { booleanValue?: boolean }
    }
  }
}

// Las respuestas sin "document" son solo marcas de tiempo (consulta vacía).
export function parseTasks(items: RunQueryItem[]): TaskData[] {
  return items
    .filter((item) => item.document)
    .map((item) => {
      const f = item.document?.fields ?? {}
      return {
        title: f.title?.stringValue ?? "",
        description: f.description?.stringValue ?? "",
        completed: f.completed?.booleanValue === true,
      }
    })
}

export async function fetchUserTasks(projectId: string, idToken: string, uid: string): Promise<TaskData[]> {
  const res = await fetch(`${documentsUrl(projectId)}:runQuery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "tasks" }],
        where: { fieldFilter: { field: { fieldPath: "userId" }, op: "EQUAL", value: { stringValue: uid } } },
        limit: MAX_TASKS,
      },
    }),
  })
  if (!res.ok) throw new Error(`Firestore runQuery falló: ${res.status} ${await res.text()}`)
  return parseTasks((await res.json()) as RunQueryItem[])
}

// Registra el envío en emailRateLimits/{uid}. Las reglas de Firestore solo
// permiten escribirlo si pasó más de un minuto desde el anterior, así que un 403
// significa "demasiado pronto". Devuelve false en ese caso.
export async function registerSend(projectId: string, idToken: string, uid: string): Promise<boolean> {
  const res = await fetch(`${documentsUrl(projectId)}:commit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      writes: [
        {
          update: { name: `projects/${projectId}/databases/(default)/documents/emailRateLimits/${uid}`, fields: {} },
          updateTransforms: [{ fieldPath: "lastSentAt", setToServerValue: "REQUEST_TIME" }],
        },
      ],
    }),
  })
  if (res.status === 403) return false
  if (!res.ok) throw new Error(`Firestore commit falló: ${res.status} ${await res.text()}`)
  return true
}
