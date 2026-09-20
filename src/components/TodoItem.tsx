import { useState } from "react"
import type { Task } from "../types/task"

interface TodoItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string, title: string, description: string) => void
}

function TodoItem({ task, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [editando, setEditando] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)

  const guardarEdicion = () => {
    if (!title.trim()) return
    onEdit(task.id, title, description)
    setEditando(false)
  }

  if (editando) {
    return (
      <li className="todo-item">
        <div className="todo-edit-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la tarea"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
          />
          <div className="form-actions">
            <button onClick={guardarEdicion}>Guardar</button>
            <button type="button" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="todo-item">
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => onToggle(task.id, e.target.checked)}
        />
        <span className={task.completed ? "todo-title completed" : "todo-title"}>
          {task.title}
        </span>
      </label>
      {task.description && <p className="todo-description">{task.description}</p>}
      <div className="todo-item-actions">
        <button onClick={() => setEditando(true)}>Editar</button>
        <button onClick={() => onDelete(task.id)}>Eliminar</button>
      </div>
    </li>
  )
}

export default TodoItem
