// Respuesta de POST /api/send-summary cuando el envío fue exitoso.
export interface SendSummaryResult {
  ok: true
  total: number
  pending: number
  completed: number
}

export type SendSummaryStatus = "idle" | "enviando" | "ok" | "error"
