// services/tasksService.js
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
} from "firebase/firestore"
import { db } from "./firebase"

const TASKS_COLLECTION = "tasks"

// Se suscribe a las tareas del usuario en tiempo real.
// onData se llama cada vez que cambian los datos.
// onError se llama si algo falla (ej: permisos).
// Devuelve una función para cancelar la suscripción (unsubscribe).
export function subscribeToTasks(userId, onData, onError) {
    const tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    )

    return onSnapshot(
        tasksQuery,
        (snapshot) => {
            const tasks = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }))
            onData(tasks)
        },
        onError
    )
}

export async function createTask(userId, { title, description }) {
    await addDoc(collection(db, TASKS_COLLECTION), {
        userId,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
}

export async function updateTask(taskId, changes) {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
        ...changes,
        updatedAt: serverTimestamp(),
    })
}

export async function toggleTaskCompleted(taskId, completed) {
    await updateTask(taskId, { completed })
}

export async function deleteTask(taskId) {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId))
}