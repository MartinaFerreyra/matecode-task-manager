import { describe, expect, it } from "vitest"
import { getAuthErrorMessage } from "../../src/features/auth/authErrors"

describe("getAuthErrorMessage", () => {
  it.each(["auth/wrong-password", "auth/user-not-found", "auth/invalid-credential"])(
    "no revela si el correo existe (%s)",
    (code) => {
      expect(getAuthErrorMessage({ code })).toBe("Correo o contraseña incorrectos.")
    },
  )

  it("explica que el correo ya está en uso", () => {
    expect(getAuthErrorMessage({ code: "auth/email-already-in-use" })).toMatch(/ya se encuentra en uso/)
  })

  it("explica qué pasó cuando se cierra el popup de Google", () => {
    expect(getAuthErrorMessage({ code: "auth/popup-closed-by-user" })).toMatch(/Google/)
  })

  it("informa problemas de conexión", () => {
    expect(getAuthErrorMessage({ code: "auth/network-request-failed" })).toMatch(/conexión/)
  })

  it("usa un mensaje genérico para códigos desconocidos, sin mostrar el texto crudo", () => {
    const msg = getAuthErrorMessage({ code: "auth/algo-raro", message: "Firebase: Error interno (auth/algo-raro)." })
    expect(msg).toBe("Ocurrió un error inesperado. Intentá de nuevo.")
  })

  it("no se rompe con valores que no son errores de Firebase", () => {
    expect(getAuthErrorMessage(null)).toMatch(/inesperado/)
    expect(getAuthErrorMessage("texto")).toMatch(/inesperado/)
    expect(getAuthErrorMessage(new Error("boom"))).toMatch(/inesperado/)
  })
})
