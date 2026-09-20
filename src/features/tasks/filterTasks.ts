import type { Task, TaskFilter } from "../../types/task"

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === "pendientes") return tasks.filter((task) => !task.completed)
  if (filter === "completadas") return tasks.filter((task) => task.completed)
  return tasks
}

export function countTasks(tasks: Task[]): Record<TaskFilter, number> {
  const completadas = tasks.filter((task) => task.completed).length
  return {
    todas: tasks.length,
    pendientes: tasks.length - completadas,
    completadas,
  }
}
