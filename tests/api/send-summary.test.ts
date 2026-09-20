// @vitest-environment node
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { beforeEach, describe, expect, it, vi } from "vitest"
import handler from "../../api/send-summary"
import { verifyFirebaseToken } from "../../api/_lib/auth"
import { fetchUserTasks, registerSend } from "../../api/_lib/firestore"
import { sendEmail } from "../../api/_lib/ses"

// Se mockean las integraciones externas: aquí solo se prueba la lógica del endpoint.
vi.mock("../../api/_lib/auth", () => ({ verifyFirebaseToken: vi.fn() }))
vi.mock("../../api/_lib/firestore", () => ({ fetchUserTasks: vi.fn(), registerSend: vi.fn() }))
vi.mock("../../api/_lib/ses", () => ({ sendEmail: vi.fn() }))

function mockRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value
      return this
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return res
}

function call(req: Partial<VercelRequest>) {
  const res = mockRes()
  return handler(req as VercelRequest, res as unknown as VercelResponse).then(() => res)
}

const validReq = {
  method: "POST",
  headers: { authorization: "Bearer token-valido" },
} as Partial<VercelRequest>

describe("POST /api/send-summary", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    process.env.FIREBASE_PROJECT_ID = "proyecto-test"
    vi.mocked(verifyFirebaseToken).mockResolvedValue({ uid: "uid-1", email: "ana@test.com", name: "Ana" })
    vi.mocked(registerSend).mockResolvedValue(true)
    vi.mocked(fetchUserTasks).mockResolvedValue([
      { title: "Una", completed: false },
      { title: "Otra", completed: true },
    ])
    vi.mocked(sendEmail).mockResolvedValue(undefined)
  })

  it("responde 500 si falta la configuración del proyecto", async () => {
    delete process.env.FIREBASE_PROJECT_ID
    const res = await call(validReq)
    expect(res.statusCode).toBe(500)
  })

  it("rechaza métodos distintos de POST con 405", async () => {
    const res = await call({ method: "GET", headers: {} })
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe("POST")
  })

  it("responde 401 si no hay token", async () => {
    const res = await call({ method: "POST", headers: {} })
    expect(res.statusCode).toBe(401)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("responde 401 si el token no es válido", async () => {
    vi.mocked(verifyFirebaseToken).mockRejectedValue(new Error("firma inválida"))
    const res = await call(validReq)
    expect(res.statusCode).toBe(401)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("responde 429 y no envía nada si se superó el límite por minuto", async () => {
    vi.mocked(registerSend).mockResolvedValue(false)
    const res = await call(validReq)
    expect(res.statusCode).toBe(429)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("envía el resumen al email del token y responde 200 con los totales", async () => {
    const res = await call({ ...validReq, body: { to: "otra-persona@test.com" } })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true, total: 2, pending: 1, completed: 1 })
    expect(verifyFirebaseToken).toHaveBeenCalledWith("token-valido", "proyecto-test")
    expect(fetchUserTasks).toHaveBeenCalledWith("proyecto-test", "token-valido", "uid-1")
    // El destinatario es siempre el del token, nunca uno enviado por el cliente.
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "ana@test.com" }))
  })

  it("responde 500 con un mensaje genérico si SES falla, sin filtrar el error", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("MessageRejected: Email address is not verified"))
    const res = await call(validReq)
    expect(res.statusCode).toBe(500)
    expect(JSON.stringify(res.body)).not.toContain("MessageRejected")
  })
})
