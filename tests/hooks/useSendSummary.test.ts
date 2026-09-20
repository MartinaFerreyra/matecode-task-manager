import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useSendSummary from "../../src/hooks/useSendSummary"
import { enviarResumenPorEmail } from "../../src/services/emailService"
import type { SendSummaryResult } from "../../src/types/email"

vi.mock("../../src/services/emailService", () => ({ enviarResumenPorEmail: vi.fn() }))

const resultado: SendSummaryResult = { ok: true, total: 3, pending: 2, completed: 1 }

describe("useSendSummary", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("empieza en reposo", () => {
    const { result } = renderHook(() => useSendSummary("ana@test.com"))
    expect(result.current).toMatchObject({ status: "idle", message: "" })
  })

  it("pasa por 'enviando' y termina en 'ok' con el email destino", async () => {
    let resolver!: (value: SendSummaryResult) => void
    vi.mocked(enviarResumenPorEmail).mockReturnValue(new Promise((resolve) => (resolver = resolve)))
    const { result } = renderHook(() => useSendSummary("ana@test.com"))

    let promesa!: Promise<void>
    act(() => {
      promesa = result.current.send()
    })
    expect(result.current.status).toBe("enviando")

    await act(async () => {
      resolver(resultado)
      await promesa
    })

    expect(result.current.status).toBe("ok")
    expect(result.current.message).toBe("Te enviamos el resumen a ana@test.com.")
  })

  it("muestra el mensaje del servidor si el envío falla", async () => {
    vi.mocked(enviarResumenPorEmail).mockRejectedValue(new Error("Ya enviaste un resumen hace poco."))
    const { result } = renderHook(() => useSendSummary("ana@test.com"))

    await act(() => result.current.send())

    expect(result.current.status).toBe("error")
    expect(result.current.message).toBe("Ya enviaste un resumen hace poco.")
  })

  it("usa un mensaje genérico si el error no trae texto", async () => {
    vi.mocked(enviarResumenPorEmail).mockRejectedValue("algo raro")
    const { result } = renderHook(() => useSendSummary("ana@test.com"))

    await act(() => result.current.send())

    expect(result.current.status).toBe("error")
    expect(result.current.message).toBe("No se pudo enviar el resumen.")
  })

  it("limpia el mensaje anterior al reintentar", async () => {
    vi.mocked(enviarResumenPorEmail).mockRejectedValueOnce(new Error("falló")).mockResolvedValueOnce(resultado)
    const { result } = renderHook(() => useSendSummary("ana@test.com"))

    await act(() => result.current.send())
    expect(result.current.status).toBe("error")

    await act(() => result.current.send())
    expect(result.current.status).toBe("ok")
  })
})
