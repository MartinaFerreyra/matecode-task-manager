import type { Task } from "../types/task"
import TodoItem from "./TodoItem"

interface TodoListProps {
  tasks: Task[]
  loading: boolean
  error: string | null
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string, title: string, description: string) => void
}

function TodoList({ tasks, loading, error, onToggle, onDelete, onEdit }: TodoListProps) {
  if (loading) return <p>Cargando tareas...</p>
  if (error) return <p className="error">{error}</p>
  if (tasks.length === 0) return <p>No tenés tareas todavía. ¡Creá la primera!</p>

  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  )
}

export default TodoList
