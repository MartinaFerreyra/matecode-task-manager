import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useAuth from "../../src/hooks/useAuth"
import useSendSummary from "../../src/hooks/useSendSummary"
import useTasks from "../../src/hooks/useTasks"
import Tasks from "../../src/pages/Tasks"
import type { SendSummaryStatus } from "../../src/types/email"
import type { Task } from "../../src/types/task"
import { makeTask } from "../mocks/tasks"

vi.mock("../../src/hooks/useAuth", () => ({ default: vi.fn() }))
vi.mock("../../src/hooks/useTasks", () => ({ default: vi.fn() }))
vi.mock("../../src/hooks/useSendSummary", () => ({ default: vi.fn() }))
vi.mock("../../src/services/authService", () => ({ logout: vi.fn() }))

const tasks: Task[] = [
  makeTask({ id: "1", title: "Pendiente uno", completed: false }),
  makeTask({ id: "2", title: "Hecha dos", completed: true }),
  makeTask({ id: "3", title: "Pendiente tres", completed: false }),
]

function setup(options: { status?: SendSummaryStatus; message?: string } = {}) {
  const tasksApi = {
    tasks,
    loading: false,
    error: null,
    addTask: vi.fn().mockResolvedValue(undefined),
    editTask: vi.fn(),
    removeTask: vi.fn(),
    toggleTask: vi.fn(),
  }
  const send = vi.fn()
  vi.mocked(useAuth).mockReturnValue({
    user: { uid: "u1", email: "ana@test.com", nombre: "Ana", foto: null },
    loading: false,
  })
  vi.mocked(useTasks).mockReturnValue(tasksApi)
  vi.mocked(useSendSummary).mockReturnValue({
    status: options.status ?? "idle",
    message: options.message ?? "",
    send,
  })
  render(<Tasks />)
  return { tasksApi, send }
}

describe("Tasks", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("muestra el conteo de cada filtro y todas las tareas", () => {
    setup()
    expect(screen.getByRole("button", { name: "Todas (3)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Pendientes (2)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Completadas (1)" })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
  })

  it("filtra por pendientes y por completadas", async () => {
    setup()

    await userEvent.click(screen.getByRole("button", { name: "Pendientes (2)" }))
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(screen.queryByText("Hecha dos")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Completadas (1)" }))
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(1)
    expect(within(items[0]).getByText("Hecha dos")).toBeInTheDocument()
  })

  it("crea una tarea desde el modal y lo cierra", async () => {
    const { tasksApi } = setup()

    await userEvent.click(screen.getByRole("button", { name: "+ Nueva tarea" }))
    expect(screen.getByRole("heading", { name: "Nueva tarea" })).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText("Título de la tarea"), "Regar plantas")
    await userEvent.click(screen.getByRole("button", { name: "Agregar tarea" }))

    expect(tasksApi.addTask).toHaveBeenCalledWith({ title: "Regar plantas", description: "" })
    expect(screen.queryByRole("heading", { name: "Nueva tarea" })).not.toBeInTheDocument()
  })

  it("el botón de resumen dispara el envío del email", async () => {
    const { send } = setup()
    await userEvent.click(screen.getByRole("button", { name: "Enviar resumen por email" }))
    expect(send).toHaveBeenCalledOnce()
  })

  it("deshabilita el botón mientras se envía", () => {
    setup({ status: "enviando" })
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled()
  })

  it("informa cuando el resumen se envió", () => {
    setup({ status: "ok", message: "Te enviamos el resumen a ana@test.com." })
    expect(screen.getByRole("status")).toHaveTextContent("Te enviamos el resumen a ana@test.com.")
  })

  it("muestra el error si el envío falló", () => {
    setup({ status: "error", message: "Ya enviaste un resumen hace poco." })
    expect(screen.getByRole("alert")).toHaveTextContent("Ya enviaste un resumen hace poco.")
  })
})
