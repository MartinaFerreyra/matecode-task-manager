import { useState } from "react"
import TodoForm from "../components/TodoForm"
import TodoList from "../components/TodoList"
import UserMenu from "../components/UserMenu"
import { countTasks, filterTasks } from "../features/tasks/filterTasks"
import useAuth from "../hooks/useAuth"
import useSendSummary from "../hooks/useSendSummary"
import useTasks from "../hooks/useTasks"
import type { NewTask, TaskFilter } from "../types/task"

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendientes", label: "Pendientes" },
  { value: "completadas", label: "Completadas" },
]

function Tasks() {
  const { user } = useAuth()
  const { tasks, loading, error, addTask, editTask, removeTask, toggleTask } = useTasks(user?.uid)
  const { status: envioStatus, message: envioMensaje, send: enviarResumen } = useSendSummary(user?.email)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [filtro, setFiltro] = useState<TaskFilter>("todas")

  const handleCrear = async (task: NewTask) => {
    await addTask(task)
    setModalAbierto(false)
  }

  const conteo = countTasks(tasks)
  const tareasFiltradas = filterTasks(tasks, filtro)

  return (
    <main className="tasks-page">
      <header className="tasks-topbar">
        <h2>Task Manager</h2>
        <UserMenu nombre={user?.nombre} foto={user?.foto} />
      </header>

      <div className="tasks-board">
        <div className="tasks-board-header">
          <h1>Mis tareas</h1>
          <div className="tasks-board-actions">
            <button
              className="btn-secondary"
              onClick={enviarResumen}
              disabled={envioStatus === "enviando"}
            >
              {envioStatus === "enviando" ? "Enviando..." : "Enviar resumen por email"}
            </button>
            <button onClick={() => setModalAbierto(true)}>+ Nueva tarea</button>
          </div>
        </div>

        {envioStatus === "ok" && <p className="email-status email-status-ok" role="status">{envioMensaje}</p>}
        {envioStatus === "error" && <p className="email-status error" role="alert">{envioMensaje}</p>}

        <div className="tasks-filters">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              className={filtro === value ? "filter-btn active" : "filter-btn"}
              onClick={() => setFiltro(value)}
            >
              {label} ({conteo[value]})
            </button>
          ))}
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
