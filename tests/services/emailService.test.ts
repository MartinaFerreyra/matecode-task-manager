import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { enviarResumenPorEmail } from "../../src/services/emailService"
import { auth } from "../../src/services/firebase"

// setup.ts reemplaza "firebase" por un objeto falso; aquí se ajusta la sesión.
const fakeAuth = auth as unknown as { currentUser: { getIdToken: () => Promise<string> } | null }

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

describe("enviarResumenPorEmail", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal("fetch", fetchMock)
    fakeAuth.currentUser = { getIdToken: vi.fn().mockResolvedValue("token-firebase") }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fakeAuth.currentUser = null
  })

  it("falla sin llamar al servidor si no hay sesión", async () => {
    fakeAuth.currentUser = null

    await expect(enviarResumenPorEmail()).rejects.toThrow("Tenés que iniciar sesión")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("llama a /api/send-summary con el ID token y devuelve el resultado", async () => {
    const respuesta = { ok: true, total: 2, pending: 1, completed: 1 }
    fetchMock.mockResolvedValue(jsonResponse(respuesta))

    await expect(enviarResumenPorEmail()).resolves.toEqual(respuesta)

    expect(fetchMock).toHaveBeenCalledWith("/api/send-summary", {
      method: "POST",
      headers: { Authorization: "Bearer token-firebase" },
    })
  })

  it("no envía el destinatario: lo decide el servidor", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, total: 0, pending: 0, completed: 0 }))

    await enviarResumenPorEmail()

    const [, init] = fetchMock.mock.calls[0]
    expect(init.body).toBeUndefined()
  })

  it("lanza el mensaje de error que devuelve el servidor", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Ya enviaste un resumen hace poco." }, 429))

    await expect(enviarResumenPorEmail()).rejects.toThrow("Ya enviaste un resumen hace poco.")
  })

  it("usa un mensaje genérico si la respuesta de error no es JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 }))

    await expect(enviarResumenPorEmail()).rejects.toThrow("No se pudo enviar el resumen.")
  })
})
