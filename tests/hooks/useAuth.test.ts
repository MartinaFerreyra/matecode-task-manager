import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useAuth from "../../src/hooks/useAuth"
import { onAuthChange } from "../../src/services/authService"
import type { AppUser } from "../../src/types/auth"

vi.mock("../../src/services/authService", () => ({ onAuthChange: vi.fn() }))

describe("useAuth", () => {
  let emit: (user: AppUser | null) => void
  const unsubscribe = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(onAuthChange).mockImplementation((callback) => {
      emit = callback
      return unsubscribe
    })
  })

  it("empieza cargando: todavía no se sabe si hay sesión", () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current).toEqual({ user: null, loading: true })
  })

  it("expone el usuario cuando Firebase confirma la sesión", () => {
    const { result } = renderHook(() => useAuth())
    const ana: AppUser = { uid: "u1", email: "ana@test.com", nombre: "Ana", foto: null }

    act(() => emit(ana))

    expect(result.current).toEqual({ user: ana, loading: false })
  })

  it("distingue 'sin sesión' de 'cargando'", () => {
    const { result } = renderHook(() => useAuth())

    act(() => emit(null))

    expect(result.current).toEqual({ user: null, loading: false })
  })

  it("cancela la suscripción al desmontar", () => {
    const { unmount } = renderHook(() => useAuth())
    expect(unsubscribe).not.toHaveBeenCalled()

    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
