// components/TodoList.jsx
import TodoItem from "./TodoItem"

function TodoList({ tasks, loading, error, onToggle, onDelete, onEdit }) {
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