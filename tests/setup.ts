import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

// Ningún test debe inicializar Firebase de verdad (necesitaría las variables .env
// y hablaría con la red). Cada test que lo necesite ajusta estos objetos falsos.
vi.mock("../src/services/firebase", () => ({
  auth: { currentUser: null },
  db: {},
}))

// Sin "globals" de vitest, Testing Library no limpia el DOM entre tests por sí sola.
afterEach(() => {
  cleanup()
})
