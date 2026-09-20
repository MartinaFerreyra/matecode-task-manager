import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import PasswordInput from "../../src/components/PasswordInput"

describe("PasswordInput", () => {
  it("oculta la contraseña por defecto y permite mostrarla y ocultarla", async () => {
    render(<PasswordInput value="secreto1" onChange={vi.fn()} />)
    const input = screen.getByPlaceholderText("Contraseña")
    expect(input).toHaveAttribute("type", "password")

    await userEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }))
    expect(input).toHaveAttribute("type", "text")

    await userEvent.click(screen.getByRole("button", { name: "Ocultar contraseña" }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("avisa el nuevo valor al escribir", async () => {
    const onChange = vi.fn()
    render(<PasswordInput value="" onChange={onChange} />)

    await userEvent.type(screen.getByPlaceholderText("Contraseña"), "a")

    expect(onChange).toHaveBeenCalledWith("a")
  })

  it("acepta un placeholder personalizado", () => {
    render(<PasswordInput value="" onChange={vi.fn()} placeholder="Nueva contraseña" />)
    expect(screen.getByPlaceholderText("Nueva contraseña")).toBeInTheDocument()
  })
})
