import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import TodoList from "../../src/components/TodoList"
import { makeTask } from "../mocks/tasks"

const handlers = { onToggle: vi.fn(), onDelete: vi.fn(), onEdit: vi.fn() }

describe("TodoList", () => {
  it("muestra el estado de carga", () => {
    render(<TodoList tasks={[]} loading error={null} {...handlers} />)
    expect(screen.getByText("Cargando tareas...")).toBeInTheDocument()
  })

  it("muestra el error si falló la carga", () => {
    render(<TodoList tasks={[]} loading={false} error="No se pudieron cargar las tareas." {...handlers} />)
    expect(screen.getByText("No se pudieron cargar las tareas.")).toBeInTheDocument()
  })

  it("invita a crear la primera tarea cuando no hay ninguna", () => {
    render(<TodoList tasks={[]} loading={false} error={null} {...handlers} />)
    expect(screen.getByText(/No tenés tareas todavía/)).toBeInTheDocument()
  })

  it("lista una fila por tarea", () => {
    const tasks = [makeTask({ id: "1", title: "Uno" }), makeTask({ id: "2", title: "Dos" })]
    render(<TodoList tasks={tasks} loading={false} error={null} {...handlers} />)

    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("Uno")).toBeInTheDocument()
    expect(screen.getByText("Dos")).toBeInTheDocument()
  })
})
