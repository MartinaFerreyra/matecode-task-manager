// hooks/useTasks.js
import { useEffect, useState, useCallback } from "react"
import {
    createTask,
    deleteTask,
    subscribeToTasks,
    toggleTaskCompleted,
    updateTask,
} from "../services/tasksService"

export default function useTasks(userId) {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!userId) {
            setTasks([])
            setLoading(false)
            return
        }

        setLoading(true)
        const unsubscribe = subscribeToTasks(
            userId,
            (data) => {
                setTasks(data)
                setLoading(false)
                setError(null)
            },
            (err) => {
                console.error("Error al escuchar tareas:", err)
                setError("No se pudieron cargar las tareas.")
                setLoading(false)
            }
        )

        return unsubscribe
    }, [userId])

    const addTask = useCallback(async (task) => {
        if (!userId) return
        try {
            await createTask(userId, task)
        } catch (err) {
            console.error("Error al crear tarea:", err)
            setError("No se pudo crear la tarea.")
        }
    }, [userId])

    const editTask = useCallback(async (id, changes) => {
        try {
            await updateTask(id, changes)
        } catch (err) {
            console.error("Error al editar tarea:", err)
            setError("No se pudo editar la tarea.")
        }
    }, [])

    const removeTask = useCallback(async (id) => {
        try {
            await deleteTask(id)
        } catch (err) {
            console.error("Error al eliminar tarea:", err)
            setError("No se pudo eliminar la tarea.")
        }
    }, [])

    const toggleTask = useCallback(async (id, completed) => {
        try {
            await toggleTaskCompleted(id, completed)
        } catch (err) {
            console.error("Error al actualizar estado:", err)
            setError("No se pudo actualizar el estado.")
        }
    }, [])

    return { tasks, loading, error, addTask, editTask, removeTask, toggleTask }
}