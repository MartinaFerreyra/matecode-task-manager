import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"

// Credenciales y configuración de AWS SES: variables de entorno de Vercel
// (solo existen en el servidor, nunca llegan al navegador). Se usan nombres
// SES_* porque Vercel reserva las variables AWS_*.
export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailMessage): Promise<void> {
  const region = process.env.SES_REGION
  const accessKeyId = process.env.SES_ACCESS_KEY_ID
  const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY
  const from = process.env.SES_FROM_EMAIL
  if (!region || !accessKeyId || !secretAccessKey || !from) {
    throw new Error("Faltan variables de entorno de SES (SES_REGION, SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY, SES_FROM_EMAIL)")
  }

  const ses = new SESv2Client({ region, credentials: { accessKeyId, secretAccessKey } })
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: text, Charset: "UTF-8" },
            Html: { Data: html, Charset: "UTF-8" },
          },
        },
      },
    })
  )
}
