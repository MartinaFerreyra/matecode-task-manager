import { act, renderHook } from "@testing-library/react"
import type { FirestoreError } from "firebase/firestore"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useTasks from "../../src/hooks/useTasks"
import {
  createTask,
  deleteTask,
  subscribeToTasks,
  toggleTaskCompleted,
  updateTask,
} from "../../src/services/tasksService"
import type { Task } from "../../src/types/task"
import { makeTask } from "../mocks/tasks"

vi.mock("../../src/services/tasksService", () => ({
  subscribeToTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  toggleTaskCompleted: vi.fn(),
}))

describe("useTasks", () => {
  let emitTasks: (tasks: Task[]) => void
  let emitError: (error: FirestoreError) => void
  const unsubscribe = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(subscribeToTasks).mockImplementation((_userId, onData, onError) => {
      emitTasks = onData
      emitError = onError
      return unsubscribe
    })
  })

  it("sin usuario no se suscribe y devuelve una lista vacía", () => {
    const { result } = renderHook(() => useTasks(undefined))

    expect(subscribeToTasks).not.toHaveBeenCalled()
    expect(result.current.tasks).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it("se suscribe a las tareas del usuario y actualiza la lista en tiempo real", () => {
    const { result } = renderHook(() => useTasks("u1"))
    expect(subscribeToTasks).toHaveBeenCalledWith("u1", expect.any(Function), expect.any(Function))
    expect(result.current.loading).toBe(true)

    act(() => emitTasks([makeTask({ id: "1" }), makeTask({ id: "2" })]))

    expect(result.current.tasks).toHaveLength(2)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("al cambiar de usuario vuelve a cargar y no muestra las tareas del anterior", () => {
    const { result, rerender } = renderHook(({ uid }) => useTasks(uid), { initialProps: { uid: "u1" } })
    act(() => emitTasks([makeTask({ id: "de-u1" })]))
    expect(result.current.tasks).toHaveLength(1)

    rerender({ uid: "u2" })

    expect(unsubscribe).toHaveBeenCalledOnce()
    expect(result.current.loading).toBe(true)
    expect(result.current.tasks).toEqual([])

    act(() => emitTasks([makeTask({ id: "de-u2" }), makeTask({ id: "de-u2-b" })]))
    expect(result.current.tasks.map((t) => t.id)).toEqual(["de-u2", "de-u2-b"])
    expect(result.current.loading).toBe(false)
  })

  it("informa el error si falla la escucha", () => {
    const { result } = renderHook(() => useTasks("u1"))

    act(() => emitError({ code: "permission-denied" } as FirestoreError))

    expect(result.current.error).toBe("No se pudieron cargar las tareas.")
    expect(result.current.loading).toBe(false)
  })

  it("cancela la suscripción al desmontar", () => {
    const { unmount } = renderHook(() => useTasks("u1"))
    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it("addTask crea la tarea para el usuario actual", async () => {
    vi.mocked(createTask).mockResolvedValue(undefined)
    const { result } = renderHook(() => useTasks("u1"))

    await act(() => result.current.addTask({ title: "Nueva", description: "" }))

    expect(createTask).toHaveBeenCalledWith("u1", { title: "Nueva", description: "" })
  })

  it("addTask no hace nada sin usuario", async () => {
    const { result } = renderHook(() => useTasks(undefined))

    await act(() => result.current.addTask({ title: "Nueva", description: "" }))

    expect(createTask).not.toHaveBeenCalled()
  })

  it("editTask, removeTask y toggleTask delegan en el servicio", async () => {
    vi.mocked(updateTask).mockResolvedValue(undefined)
    vi.mocked(deleteTask).mockResolvedValue(undefined)
    vi.mocked(toggleTaskCompleted).mockResolvedValue(undefined)
    const { result } = renderHook(() => useTasks("u1"))

    await act(async () => {
      await result.current.editTask("t1", { title: "Editada" })
      await result.current.removeTask("t2")
      await result.current.toggleTask("t3", true)
    })

    expect(updateTask).toHaveBeenCalledWith("t1", { title: "Editada" })
    expect(deleteTask).toHaveBeenCalledWith("t2")
    expect(toggleTaskCompleted).toHaveBeenCalledWith("t3", true)
  })

  it.each([
    ["addTask", () => vi.mocked(createTask), (r: ReturnType<typeof useTasks>) => r.addTask({ title: "x", description: "" }), "No se pudo crear la tarea."],
    ["editTask", () => vi.mocked(updateTask), (r: ReturnType<typeof useTasks>) => r.editTask("t", {}), "No se pudo editar la tarea."],
    ["removeTask", () => vi.mocked(deleteTask), (r: ReturnType<typeof useTasks>) => r.removeTask("t"), "No se pudo eliminar la tarea."],
    ["toggleTask", () => vi.mocked(toggleTaskCompleted), (r: ReturnType<typeof useTasks>) => r.toggleTask("t", true), "No se pudo actualizar el estado."],
  ])("%s informa el error si el servicio falla", async (_name, getMock, run, mensaje) => {
    getMock().mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useTasks("u1"))

    await act(() => run(result.current))

    expect(result.current.error).toBe(mensaje)
  })
})
