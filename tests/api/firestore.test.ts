// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchUserTasks, parseTasks, registerSend } from "../../api/_lib/firestore"

describe("parseTasks", () => {
  it("convierte documentos de Firestore REST en tareas", () => {
    const tasks = parseTasks([
      {
        document: {
          fields: {
            title: { stringValue: "Comprar mate" },
            description: { stringValue: "yerba" },
            completed: { booleanValue: true },
          },
        },
      },
      { document: { fields: { title: { stringValue: "Sin estado" } } } },
    ])
    expect(tasks).toEqual([
      { title: "Comprar mate", description: "yerba", completed: true },
      { title: "Sin estado", description: "", completed: false },
    ])
  })

  it("ignora la marca de tiempo que Firestore devuelve cuando no hay resultados", () => {
    expect(parseTasks([{}])).toEqual([])
  })
})

describe("llamadas a Firestore REST", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("fetchUserTasks consulta las tareas del uid usando el token del usuario", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ document: { fields: { title: { stringValue: "A" } } } }]), { status: 200 }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const tasks = await fetchUserTasks("proyecto", "token-abc", "uid-1")

    expect(tasks).toHaveLength(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain("/projects/proyecto/databases/(default)/documents:runQuery")
    expect(init.headers.Authorization).toBe("Bearer token-abc")
    expect(JSON.parse(init.body).structuredQuery.where.fieldFilter.value).toEqual({ stringValue: "uid-1" })
  })

  it("fetchUserTasks falla si Firestore responde con error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })))
    await expect(fetchUserTasks("p", "t", "u")).rejects.toThrow("runQuery")
  })

  it("registerSend devuelve true cuando la escritura es aceptada", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })))
    await expect(registerSend("p", "t", "u")).resolves.toBe(true)
  })

  it("registerSend devuelve false cuando las reglas rechazan por límite (403)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 403 })))
    await expect(registerSend("p", "t", "u")).resolves.toBe(false)
  })

  it("registerSend lanza error ante otros fallos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500 })))
    await expect(registerSend("p", "t", "u")).rejects.toThrow("commit")
  })
})
