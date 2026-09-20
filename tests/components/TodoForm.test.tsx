import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import TodoForm from "../../src/components/TodoForm"

describe("TodoForm", () => {
  it("muestra un error y no envía si el título está vacío", async () => {
    const onSubmit = vi.fn()
    render(<TodoForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole("button", { name: "Agregar tarea" }))

    expect(screen.getByText("El título es obligatorio.")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("trata un título de solo espacios como vacío", async () => {
    const onSubmit = vi.fn()
    render(<TodoForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByPlaceholderText("Título de la tarea"), "   ")
    await userEvent.click(screen.getByRole("button", { name: "Agregar tarea" }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("envía título y descripción y limpia el formulario", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByPlaceholderText("Título de la tarea"), "Comprar yerba")
    await userEvent.type(screen.getByPlaceholderText("Descripción (opcional)"), "La de siempre")
    await userEvent.click(screen.getByRole("button", { name: "Agregar tarea" }))

    expect(onSubmit).toHaveBeenCalledWith({ title: "Comprar yerba", description: "La de siempre" })
    await waitFor(() => expect(screen.getByPlaceholderText("Título de la tarea")).toHaveValue(""))
    expect(screen.getByPlaceholderText("Descripción (opcional)")).toHaveValue("")
  })

  it("solo muestra Cancelar si se pasa onCancel, y lo llama al hacer clic", async () => {
    const { rerender } = render(<TodoForm onSubmit={vi.fn()} />)
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument()

    const onCancel = vi.fn()
    rerender(<TodoForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
