import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore"
import type { NewTask, Task, TaskChanges } from "../types/task"
import { db } from "./firebase"

const TASKS_COLLECTION = "tasks"

// Se suscribe a las tareas del usuario en tiempo real.
// onData se llama cada vez que cambian los datos.
// onError se llama si algo falla (ej: permisos).
// Devuelve una función para cancelar la suscripción (unsubscribe).
export function subscribeToTasks(
  userId: string,
  onData: (tasks: Task[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const tasksQuery = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  )

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      onData(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Task))
    },
    onError,
  )
}

export async function createTask(userId: string, { title, description }: NewTask): Promise<void> {
  await addDoc(collection(db, TASKS_COLLECTION), {
    userId,
    title: title.trim(),
    description: description.trim(),
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateTask(taskId: string, changes: TaskChanges): Promise<void> {
  await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
    ...changes,
    updatedAt: serverTimestamp(),
  })
}

export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  await updateTask(taskId, { completed })
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId))
}
