import type { FirestoreError } from "firebase/firestore"
import {
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  updateDoc,
  where,
} from "firebase/firestore"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  createTask,
  deleteTask,
  subscribeToTasks,
  toggleTaskCompleted,
  updateTask,
} from "../../src/services/tasksService"

// Firestore se reemplaza por funciones falsas que devuelven descripciones simples.
vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, name: string) => ({ collection: name })),
  doc: vi.fn((_db, name: string, id: string) => ({ doc: `${name}/${id}` })),
  query: vi.fn((...parts: unknown[]) => ({ query: parts })),
  where: vi.fn((field: string, op: string, value: unknown) => ({ where: [field, op, value] })),
  orderBy: vi.fn((field: string, dir: string) => ({ orderBy: [field, dir] })),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}))

describe("tasksService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("createTask guarda la tarea del usuario, sin espacios sobrantes y pendiente", async () => {
    await createTask("u1", { title: "  Comprar yerba  ", description: "  la de siempre " })

    expect(addDoc).toHaveBeenCalledWith(
      { collection: "tasks" },
      {
        userId: "u1",
        title: "Comprar yerba",
        description: "la de siempre",
        completed: false,
        createdAt: "SERVER_TIMESTAMP",
        updatedAt: "SERVER_TIMESTAMP",
      },
    )
  })

  it("updateTask aplica los cambios y actualiza updatedAt", async () => {
    await updateTask("t1", { title: "Nuevo" })

    expect(updateDoc).toHaveBeenCalledWith({ doc: "tasks/t1" }, { title: "Nuevo", updatedAt: "SERVER_TIMESTAMP" })
  })

  it("toggleTaskCompleted actualiza solo el estado", async () => {
    await toggleTaskCompleted("t1", true)

    expect(updateDoc).toHaveBeenCalledWith({ doc: "tasks/t1" }, { completed: true, updatedAt: "SERVER_TIMESTAMP" })
  })

  it("deleteTask elimina el documento", async () => {
    await deleteTask("t1")

    expect(deleteDoc).toHaveBeenCalledWith({ doc: "tasks/t1" })
  })

  describe("subscribeToTasks", () => {
    it("filtra por userId y ordena de más nueva a más vieja", () => {
      vi.mocked(onSnapshot).mockReturnValue(vi.fn())

      subscribeToTasks("u1", vi.fn(), vi.fn())

      expect(where).toHaveBeenCalledWith("userId", "==", "u1")
      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc")
    })

    it("entrega las tareas con su id y devuelve la función para cancelar", () => {
      const unsubscribe = vi.fn()
      vi.mocked(onSnapshot).mockImplementation(((_query: unknown, next: (snap: unknown) => void) => {
        next({ docs: [{ id: "a", data: () => ({ title: "Una", completed: false }) }] })
        return unsubscribe
      }) as unknown as typeof onSnapshot)
      const onData = vi.fn()

      const cancel = subscribeToTasks("u1", onData, vi.fn())

      expect(onData).toHaveBeenCalledWith([{ id: "a", title: "Una", completed: false }])
      expect(cancel).toBe(unsubscribe)
    })

    it("pasa el manejador de errores a Firestore", () => {
      vi.mocked(onSnapshot).mockReturnValue(vi.fn())
      const onError = vi.fn() as (e: FirestoreError) => void

      subscribeToTasks("u1", vi.fn(), onError)

      expect(vi.mocked(onSnapshot).mock.calls[0][2]).toBe(onError)
    })
  })
})
