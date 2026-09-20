// @vitest-environment node
import { describe, expect, it } from "vitest"
import { buildSummary, escapeHtml } from "../../api/_lib/summary"

describe("buildSummary", () => {
  const tasks = [
    { title: "Comprar mate", completed: false },
    { title: "Escribir tests", completed: true },
    { title: "Deploy", completed: false },
  ]

  it("cuenta totales, pendientes y completadas", () => {
    const s = buildSummary(tasks, "Ana")
    expect(s.total).toBe(3)
    expect(s.pending).toBe(2)
    expect(s.completed).toBe(1)
    expect(s.subject).toContain("2 pendientes")
    expect(s.subject).toContain("1 completadas")
  })

  it("incluye los títulos en texto plano y en HTML", () => {
    const s = buildSummary(tasks, "Ana")
    expect(s.text).toContain("- Comprar mate")
    expect(s.text).toContain("- Escribir tests")
    expect(s.html).toContain("<li>Deploy</li>")
  })

  it("funciona sin tareas", () => {
    const s = buildSummary([], "Ana")
    expect(s.total).toBe(0)
    expect(s.text).toContain("Pendientes: ninguna")
    expect(s.html).toContain("Ninguna")
  })

  it("escapa HTML en títulos y en el nombre", () => {
    const s = buildSummary([{ title: "<script>alert(1)</script>", completed: false }], "<b>Ana</b>")
    expect(s.html).not.toContain("<script>")
    expect(s.html).not.toContain("<b>Ana</b>")
    expect(s.html).toContain("&lt;script&gt;")
  })

  it("no deja que un título con saltos de línea rompa el texto ni el asunto", () => {
    const s = buildSummary([{ title: "linea1\nlinea2", completed: false }], "Ana")
    expect(s.text).toContain("- linea1 linea2")
    expect(s.subject).not.toContain("\n")
  })
})

describe("escapeHtml", () => {
  it("escapa los caracteres especiales", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;")
  })
})
