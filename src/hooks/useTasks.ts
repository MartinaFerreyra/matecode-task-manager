import { useCallback, useEffect, useState } from "react"
import {
  createTask,
  deleteTask,
  subscribeToTasks,
  toggleTaskCompleted,
  updateTask,
} from "../services/tasksService"
import type { NewTask, Task, TaskChanges } from "../types/task"

// Referencia estable para "sin tareas" (evita crear un array nuevo en cada render).
const NO_TASKS: Task[] = []

export default function useTasks(userId: string | undefined) {
  // Las tareas se guardan junto al usuario al que pertenecen. Así "cargando" se
  // deriva (hay usuario pero todavía no llegó su primer snapshot) y no hace falta
  // setear estado dentro del efecto al cambiar de usuario.
  const [snapshot, setSnapshot] = useState<{ userId: string; tasks: Task[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Sin usuario no hay nada que escuchar.
    if (!userId) return

    return subscribeToTasks(
      userId,
      (data) => {
        setSnapshot({ userId, tasks: data })
        setError(null)
      },
      (err) => {
        console.error("Error al escuchar tareas:", err)
        setError("No se pudieron cargar las tareas.")
        setSnapshot({ userId, tasks: [] })
      },
    )
  }, [userId])

  const current = snapshot && snapshot.userId === userId ? snapshot : null

  const addTask = useCallback(
    async (task: NewTask) => {
      if (!userId) return
      try {
        await createTask(userId, task)
      } catch (err) {
        console.error("Error al crear tarea:", err)
        setError("No se pudo crear la tarea.")
      }
    },
    [userId],
  )

  const editTask = useCallback(async (id: string, changes: TaskChanges) => {
    try {
      await updateTask(id, changes)
    } catch (err) {
      console.error("Error al editar tarea:", err)
      setError("No se pudo editar la tarea.")
    }
  }, [])

  const removeTask = useCallback(async (id: string) => {
    try {
      await deleteTask(id)
    } catch (err) {
      console.error("Error al eliminar tarea:", err)
      setError("No se pudo eliminar la tarea.")
    }
  }, [])

  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    try {
      await toggleTaskCompleted(id, completed)
    } catch (err) {
      console.error("Error al actualizar estado:", err)
      setError("No se pudo actualizar el estado.")
    }
  }, [])

  return {
    tasks: current?.tasks ?? NO_TASKS,
    loading: Boolean(userId) && !current,
    error,
    addTask,
    editTask,
    removeTask,
    toggleTask,
  }
}
