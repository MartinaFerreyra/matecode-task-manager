import type { Task } from "../../src/types/task"

// Fábrica de tareas para los tests: solo hace falta indicar lo que importa en cada caso.
export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    userId: "uid-1",
    title: "Tarea de ejemplo",
    description: "",
    completed: false,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}
