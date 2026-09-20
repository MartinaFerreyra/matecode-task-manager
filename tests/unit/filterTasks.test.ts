import { describe, expect, it } from "vitest"
import { countTasks, filterTasks } from "../../src/features/tasks/filterTasks"
import { makeTask } from "../mocks/tasks"

const tasks = [
  makeTask({ id: "1", completed: false }),
  makeTask({ id: "2", completed: true }),
  makeTask({ id: "3", completed: false }),
]

describe("filterTasks", () => {
  it("'todas' devuelve todas las tareas", () => {
    expect(filterTasks(tasks, "todas")).toHaveLength(3)
  })

  it("'pendientes' devuelve solo las no completadas", () => {
    expect(filterTasks(tasks, "pendientes").map((t) => t.id)).toEqual(["1", "3"])
  })

  it("'completadas' devuelve solo las completadas", () => {
    expect(filterTasks(tasks, "completadas").map((t) => t.id)).toEqual(["2"])
  })

  it("funciona con una lista vacía", () => {
    expect(filterTasks([], "pendientes")).toEqual([])
  })
})

describe("countTasks", () => {
  it("cuenta cada categoría", () => {
    expect(countTasks(tasks)).toEqual({ todas: 3, pendientes: 2, completadas: 1 })
  })

  it("devuelve ceros sin tareas", () => {
    expect(countTasks([])).toEqual({ todas: 0, pendientes: 0, completadas: 0 })
  })
})
