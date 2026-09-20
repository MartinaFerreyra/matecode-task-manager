// pages/Tasks.jsx
import { useState } from "react"
import useUsuario from "../hooks/useUsuario"
import useTasks from "../hooks/useTasks"
import UserMenu from "../components/UserMenu"
import TodoForm from "../components/TodoForm"
import TodoList from "../components/TodoList"
import { enviarResumenPorEmail } from "../services/emailService"

function Tasks() {
    const { usuario } = useUsuario()
    const { tasks, loading, error, addTask, editTask, removeTask, toggleTask } = useTasks(usuario?.uid)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [filtro, setFiltro] = useState("todas") // "todas" | "pendientes" | "completadas"

    const [envioEmail, setEnvioEmail] = useState({ estado: "idle", mensaje: "" }) // estado: "idle" | "enviando" | "ok" | "error"

    const handleEnviarResumen = async () => {
        setEnvioEmail({ estado: "enviando", mensaje: "" })
        try {
            await enviarResumenPorEmail()
            setEnvioEmail({ estado: "ok", mensaje: `Te enviamos el resumen a ${usuario?.email}.` })
        } catch (err) {
            console.error("Error al enviar el resumen:", err)
            // Los errores de la función ya traen un mensaje pensado para el usuario.
            setEnvioEmail({ estado: "error", mensaje: err.message || "No se pudo enviar el resumen." })
        }
    }

    const handleCrear = async (task) => {
        await addTask(task)
        setModalAbierto(false)
    }

    const tareasFiltradas = tasks.filter((task) => {
        if (filtro === "pendientes") return !task.completed
        if (filtro === "completadas") return task.completed
        return true // "todas"
    })

    return (
        <main className="tasks-page">
            <header className="tasks-topbar">
                <h2>Task Manager</h2>
                <UserMenu nombre={usuario?.nombre} foto={usuario?.foto} />
            </header>

            <div className="tasks-board">
                <div className="tasks-board-header">
                    <h1>Mis tareas</h1>
                    <div className="tasks-board-actions">
                        <button
                            className="btn-secondary"
                            onClick={handleEnviarResumen}
                            disabled={envioEmail.estado === "enviando"}
                        >
                            {envioEmail.estado === "enviando" ? "Enviando..." : "Enviar resumen por email"}
                        </button>
                        <button onClick={() => setModalAbierto(true)}>+ Nueva tarea</button>
                    </div>
                </div>

                {envioEmail.estado === "ok" && <p className="email-status email-status-ok" role="status">{envioEmail.mensaje}</p>}
                {envioEmail.estado === "error" && <p className="email-status error" role="alert">{envioEmail.mensaje}</p>}

                <div className="tasks-filters">
                    <button
                        className={filtro === "todas" ? "filter-btn active" : "filter-btn"}
                        onClick={() => setFiltro("todas")}
                    >
                        Todas ({tasks.length})
                    </button>
                    <button
                        className={filtro === "pendientes" ? "filter-btn active" : "filter-btn"}
                        onClick={() => setFiltro("pendientes")}
                    >
                        Pendientes ({tasks.filter(t => !t.completed).length})
                    </button>
                    <button
                        className={filtro === "completadas" ? "filter-btn active" : "filter-btn"}
                        onClick={() => setFiltro("completadas")}
                    >
                        Completadas ({tasks.filter(t => t.completed).length})
                    </button>
                </div>

                <div className="tasks-board-body">
                    <TodoList
                        tasks={tareasFiltradas}
                        loading={loading}
                        error={error}
                        onToggle={toggleTask}
                        onDelete={removeTask}
                        onEdit={(id, title, description) => editTask(id, { title, description })}
                    />
                </div>
            </div>

            {modalAbierto && (
                <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva tarea</h2>
                        <TodoForm onSubmit={handleCrear} onCancel={() => setModalAbierto(false)} />
                    </div>
                </div>
            )}
        </main>
    )
}

export default Tasks