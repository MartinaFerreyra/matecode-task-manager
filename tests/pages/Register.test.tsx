import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Register from "../../src/pages/Register"
import { loginWithGoogle, registerWithEmail } from "../../src/services/authService"

vi.mock("../../src/services/authService", () => ({
  registerWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
}))

function renderRegister() {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  )
}

async function completarFormulario(email: string, password: string) {
  await userEvent.type(screen.getByPlaceholderText("Correo electrónico"), email)
  await userEvent.type(screen.getByPlaceholderText("Contraseña"), password)
  await userEvent.click(screen.getByRole("button", { name: "Registrarse" }))
}

describe("Register", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("pide completar los datos", async () => {
    renderRegister()
    await userEvent.click(screen.getByRole("button", { name: "Registrarse" }))

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresá tu correo y una contraseña.")
    expect(registerWithEmail).not.toHaveBeenCalled()
  })

  it.each([
    ["ab1", "al menos 6 caracteres"],
    ["123456", "al menos una letra"],
    ["abcdef", "al menos un número"],
  ])("rechaza la contraseña débil %s sin llamar al servicio", async (password, mensaje) => {
    renderRegister()

    await completarFormulario("ana@test.com", password)

    expect(screen.getByRole("alert")).toHaveTextContent(mensaje)
    expect(registerWithEmail).not.toHaveBeenCalled()
  })

  it("registra al usuario con datos válidos", async () => {
    vi.mocked(registerWithEmail).mockResolvedValue(undefined)
    renderRegister()

    await completarFormulario("ana@test.com", "secreto1")

    expect(registerWithEmail).toHaveBeenCalledWith("ana@test.com", "secreto1")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("avisa si el correo ya está en uso", async () => {
    vi.mocked(registerWithEmail).mockRejectedValue({ code: "auth/email-already-in-use" })
    renderRegister()

    await completarFormulario("ana@test.com", "secreto1")

    expect(await screen.findByRole("alert")).toHaveTextContent("ya se encuentra en uso")
  })

  it("permite registrarse con Google", async () => {
    vi.mocked(loginWithGoogle).mockResolvedValue(undefined)
    renderRegister()

    await userEvent.click(screen.getByRole("button", { name: "Registrarse con Google" }))

    expect(loginWithGoogle).toHaveBeenCalledOnce()
  })

  it("enlaza a iniciar sesión", () => {
    renderRegister()
    expect(screen.getByRole("link", { name: "Iniciar Sesion" })).toHaveAttribute("href", "/login")
  })
})
