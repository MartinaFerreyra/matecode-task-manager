import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useAuth from "../../src/hooks/useAuth"
import ProtectedRoute from "../../src/routes/ProtectedRoute"
import PublicRoute from "../../src/routes/PublicRoute"
import type { AppUser } from "../../src/types/auth"

vi.mock("../../src/hooks/useAuth", () => ({ default: vi.fn() }))

const usuario: AppUser = { uid: "u1", email: "ana@test.com", nombre: "Ana", foto: null }

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<PublicRoute><p>pantalla de login</p></PublicRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><p>tareas privadas</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("muestra 'Cargando...' mientras Firebase resuelve la sesión, sin exponer las tareas", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true })
    renderAt("/tasks")

    expect(screen.getByText("Cargando...")).toBeInTheDocument()
    expect(screen.queryByText("tareas privadas")).not.toBeInTheDocument()
  })

  it("redirige a /login si no hay sesión", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false })
    renderAt("/tasks")

    expect(screen.getByText("pantalla de login")).toBeInTheDocument()
    expect(screen.queryByText("tareas privadas")).not.toBeInTheDocument()
  })

  it("muestra el contenido si hay sesión", () => {
    vi.mocked(useAuth).mockReturnValue({ user: usuario, loading: false })
    renderAt("/tasks")

    expect(screen.getByText("tareas privadas")).toBeInTheDocument()
  })
})

describe("PublicRoute", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("muestra el login si no hay sesión", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false })
    renderAt("/login")

    expect(screen.getByText("pantalla de login")).toBeInTheDocument()
  })

  it("manda a /tasks a quien ya tiene sesión", () => {
    vi.mocked(useAuth).mockReturnValue({ user: usuario, loading: false })
    renderAt("/login")

    expect(screen.getByText("tareas privadas")).toBeInTheDocument()
    expect(screen.queryByText("pantalla de login")).not.toBeInTheDocument()
  })

  it("espera mientras se resuelve la sesión", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true })
    renderAt("/login")

    expect(screen.getByText("Cargando...")).toBeInTheDocument()
  })
})
