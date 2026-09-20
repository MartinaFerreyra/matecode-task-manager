import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Unsubscribe,
} from "firebase/auth"
import type { AppUser } from "../types/auth"
import { auth } from "./firebase"

// Todas las funciones devuelven una promesa que se rechaza con el error de Firebase.
// Quien las llama decide cómo mostrarlo (ver features/auth/authErrors.ts).

const googleProvider = new GoogleAuthProvider()

export async function loginWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function registerWithEmail(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

// Avisa cada vez que cambia la sesión. Devuelve la función para cancelar la suscripción.
export function onAuthChange(callback: (user: AppUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    callback(
      user
        ? {
            uid: user.uid,
            email: user.email,
            nombre: user.displayName || user.email || "Usuario",
            foto: user.photoURL,
          }
        : null,
    )
  })
}
