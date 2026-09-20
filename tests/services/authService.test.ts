import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  loginWithEmail,
  loginWithGoogle,
  logout,
  onAuthChange,
  registerWithEmail,
  sendPasswordReset,
} from "../../src/services/authService"
import { auth } from "../../src/services/firebase"
import type { AppUser } from "../../src/types/auth"

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: class GoogleAuthProvider {},
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}))

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loginWithEmail delega en Firebase con el correo y la contraseña", async () => {
    await loginWithEmail("ana@test.com", "secreto1")
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "ana@test.com", "secreto1")
  })

  it("registerWithEmail crea la cuenta", async () => {
    await registerWithEmail("ana@test.com", "secreto1")
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, "ana@test.com", "secreto1")
  })

  it("loginWithGoogle abre el popup de Google", async () => {
    await loginWithGoogle()
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.anything())
  })

  it("logout cierra la sesión", async () => {
    await logout()
    expect(signOut).toHaveBeenCalledWith(auth)
  })

  it("sendPasswordReset envía el email de recuperación", async () => {
    await sendPasswordReset("ana@test.com")
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, "ana@test.com")
  })

  it("los errores de Firebase se propagan a quien llama", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: "auth/invalid-credential" })
    await expect(loginWithEmail("a@b.com", "x")).rejects.toEqual({ code: "auth/invalid-credential" })
  })

  describe("onAuthChange", () => {
    function emitFromFirebase(user: Partial<User> | null) {
      vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, next: (u: unknown) => void) => {
        next(user)
        return vi.fn()
      }) as unknown as typeof onAuthStateChanged)
    }

    it("convierte el usuario de Firebase en un AppUser", () => {
      emitFromFirebase({ uid: "u1", email: "ana@test.com", displayName: "Ana", photoURL: "http://foto" })
      const callback = vi.fn<(u: AppUser | null) => void>()

      onAuthChange(callback)

      expect(callback).toHaveBeenCalledWith({ uid: "u1", email: "ana@test.com", nombre: "Ana", foto: "http://foto" })
    })

    it("usa el email como nombre si no hay displayName", () => {
      emitFromFirebase({ uid: "u1", email: "ana@test.com", displayName: null, photoURL: null })
      const callback = vi.fn()

      onAuthChange(callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ nombre: "ana@test.com", foto: null }))
    })

    it("avisa null cuando no hay sesión", () => {
      emitFromFirebase(null)
      const callback = vi.fn()

      onAuthChange(callback)

      expect(callback).toHaveBeenCalledWith(null)
    })

    it("devuelve la función para cancelar la suscripción", () => {
      const unsubscribe = vi.fn()
      vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe)

      expect(onAuthChange(vi.fn())).toBe(unsubscribe)
    })
  })
})
