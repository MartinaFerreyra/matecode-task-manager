import type { Timestamp } from "firebase/firestore"

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  completed: boolean
  // Firestore devuelve null mientras el serverTimestamp() todavía no se resolvió.
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface NewTask {
  title: string
  description: string
}

export type TaskChanges = Partial<Pick<Task, "title" | "description" | "completed">>

export type TaskFilter = "todas" | "pendientes" | "completadas"
