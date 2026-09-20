import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ForgotPassword from "../../src/pages/ForgotPassword"
import { sendPasswordReset } from "../../src/services/authService"

vi.mock("../../src/services/authService", () => ({ sendPasswordReset: vi.fn() }))

function renderPage() {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  )
}

describe("ForgotPassword", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("pide el correo si está vacío", async () => {
    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Enviar link de recuperación" }))

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresá tu correo electrónico.")
    expect(sendPasswordReset).not.toHaveBeenCalled()
  })

  it("envía el link y confirma al usuario", async () => {
    vi.mocked(sendPasswordReset).mockResolvedValue(undefined)
    renderPage()

    await userEvent.type(screen.getByPlaceholderText("Correo electrónico"), "ana@test.com")
    await userEvent.click(screen.getByRole("button", { name: "Enviar link de recuperación" }))

    expect(sendPasswordReset).toHaveBeenCalledWith("ana@test.com")
    expect(await screen.findByText(/Te enviamos un email/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Enviar link de recuperación" })).not.toBeInTheDocument()
  })

  it("muestra el error si falla el envío", async () => {
    vi.mocked(sendPasswordReset).mockRejectedValue({ code: "auth/network-request-failed" })
    renderPage()

    await userEvent.type(screen.getByPlaceholderText("Correo electrónico"), "ana@test.com")
    await userEvent.click(screen.getByRole("button", { name: "Enviar link de recuperación" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("No hay conexión")
  })
})
