import { useState, type FormEvent } from "react"
import type { NewTask } from "../types/task"

interface TodoFormProps {
  onSubmit: (task: NewTask) => Promise<void> | void
  onCancel?: () => void
}

function TodoForm({ onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("El título es obligatorio.")
      return
    }
    setError("")
    await onSubmit({ title, description })
    setTitle("")
    setDescription("")
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        placeholder="Título de la tarea"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <span className="error">{error}</span>}
      <div className="form-actions">
        <button type="submit">Agregar tarea</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  )
}

export default TodoForm
