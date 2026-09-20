import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Login from "../../src/pages/Login"
import { loginWithEmail, loginWithGoogle } from "../../src/services/authService"

vi.mock("../../src/services/authService", () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
}))

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  )
}

async function completarFormulario(email: string, password: string) {
  await userEvent.type(screen.getByPlaceholderText("Correo electrónico"), email)
  await userEvent.type(screen.getByPlaceholderText("Contraseña"), password)
  await userEvent.click(screen.getByRole("button", { name: "Iniciar Sesion" }))
}

describe("Login", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("pide completar los datos y no llama al servicio si faltan", async () => {
    renderLogin()
    await userEvent.click(screen.getByRole("button", { name: "Iniciar Sesion" }))

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresá tu correo y tu contraseña.")
    expect(loginWithEmail).not.toHaveBeenCalled()
  })

  it("inicia sesión con el correo y la contraseña ingresados", async () => {
    vi.mocked(loginWithEmail).mockResolvedValue(undefined)
    renderLogin()

    await completarFormulario("ana@test.com", "secreto1")

    expect(loginWithEmail).toHaveBeenCalledWith("ana@test.com", "secreto1")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("muestra un mensaje claro si las credenciales son incorrectas", async () => {
    vi.mocked(loginWithEmail).mockRejectedValue({ code: "auth/invalid-credential" })
    renderLogin()

    await completarFormulario("ana@test.com", "mala")

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.")
  })

  it("permite ingresar con Google", async () => {
    vi.mocked(loginWithGoogle).mockResolvedValue(undefined)
    renderLogin()

    await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión con Google" }))

    expect(loginWithGoogle).toHaveBeenCalledOnce()
  })

  it("muestra un error si se cierra la ventana de Google", async () => {
    vi.mocked(loginWithGoogle).mockRejectedValue({ code: "auth/popup-closed-by-user" })
    renderLogin()

    await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión con Google" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/Google/)
  })

  it("enlaza a registro y a recuperar contraseña", () => {
    renderLogin()
    expect(screen.getByRole("link", { name: "Crea una" })).toHaveAttribute("href", "/register")
    expect(screen.getByRole("link", { name: /Olvidaste tu contraseña/ })).toHaveAttribute("href", "/forgot-password")
  })
})
