import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import TodoItem from "../../src/components/TodoItem"
import { makeTask } from "../mocks/tasks"

function setup(overrides = {}) {
  const handlers = { onToggle: vi.fn(), onDelete: vi.fn(), onEdit: vi.fn() }
  const task = makeTask({ id: "a", title: "Estudiar", description: "capítulo 3", ...overrides })
  render(
    <ul>
      <TodoItem task={task} {...handlers} />
    </ul>,
  )
  return handlers
}

describe("TodoItem", () => {
  it("muestra el título y la descripción", () => {
    setup()
    expect(screen.getByText("Estudiar")).toBeInTheDocument()
    expect(screen.getByText("capítulo 3")).toBeInTheDocument()
  })

  it("no muestra descripción si no tiene", () => {
    setup({ description: "" })
    expect(screen.queryByText("capítulo 3")).not.toBeInTheDocument()
  })

  it("marca el título como completado", () => {
    setup({ completed: true })
    expect(screen.getByRole("checkbox")).toBeChecked()
    expect(screen.getByText("Estudiar")).toHaveClass("completed")
  })

  it("al tildar el checkbox llama a onToggle con el nuevo estado", async () => {
    const { onToggle } = setup({ completed: false })
    await userEvent.click(screen.getByRole("checkbox"))
    expect(onToggle).toHaveBeenCalledWith("a", true)
  })

  it("llama a onDelete con el id de la tarea", async () => {
    const { onDelete } = setup()
    await userEvent.click(screen.getByRole("button", { name: "Eliminar" }))
    expect(onDelete).toHaveBeenCalledWith("a")
  })

  it("permite editar título y descripción y guardar", async () => {
    const { onEdit } = setup()
    await userEvent.click(screen.getByRole("button", { name: "Editar" }))

    const title = screen.getByPlaceholderText("Título de la tarea")
    await userEvent.clear(title)
    await userEvent.type(title, "Estudiar más")
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

    expect(onEdit).toHaveBeenCalledWith("a", "Estudiar más", "capítulo 3")
    expect(screen.queryByPlaceholderText("Título de la tarea")).not.toBeInTheDocument()
  })

  it("no guarda si el título queda vacío y sigue en modo edición", async () => {
    const { onEdit } = setup()
    await userEvent.click(screen.getByRole("button", { name: "Editar" }))
    await userEvent.clear(screen.getByPlaceholderText("Título de la tarea"))
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByPlaceholderText("Título de la tarea")).toBeInTheDocument()
  })

  it("cancelar la edición vuelve a la vista normal sin guardar", async () => {
    const { onEdit } = setup()
    await userEvent.click(screen.getByRole("button", { name: "Editar" }))
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText("Estudiar")).toBeInTheDocument()
  })
})
