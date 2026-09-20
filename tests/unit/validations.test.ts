import { describe, expect, it } from "vitest"
import { validarPassword } from "../../src/utils/validations"

describe("validarPassword", () => {
  it("acepta una contraseña con letras, números y 6 caracteres o más", () => {
    expect(validarPassword("abc123")).toBeNull()
  })

  it("rechaza contraseñas de menos de 6 caracteres", () => {
    expect(validarPassword("ab1")).toBe("La contraseña debe tener al menos 6 caracteres.")
  })

  it("rechaza contraseñas sin letras", () => {
    expect(validarPassword("123456")).toBe("La contraseña debe contener al menos una letra.")
  })

  it("rechaza contraseñas sin números", () => {
    expect(validarPassword("abcdef")).toBe("La contraseña debe contener al menos un número.")
  })

  it("rechaza la contraseña vacía", () => {
    expect(validarPassword("")).toBe("La contraseña debe tener al menos 6 caracteres.")
  })
})
