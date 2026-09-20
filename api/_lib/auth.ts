import { createRemoteJWKSet, jwtVerify } from "jose"

// Claves públicas con las que Firebase firma los ID tokens. jose las cachea
// entre invocaciones mientras el contenedor de Lambda siga "caliente".
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
)

export interface FirebaseUser {
  uid: string
  email: string
  name?: string
}

// Verifica firma, expiración, emisor y audiencia del ID token de Firebase.
// Lanza un error si el token no es válido.
export async function verifyFirebaseToken(idToken: string, projectId: string): Promise<FirebaseUser> {
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  })

  const uid = payload.sub
  const email = payload.email
  if (!uid || typeof email !== "string" || !email) {
    throw new Error("El token no incluye uid o email")
  }
  return { uid, email, name: typeof payload.name === "string" ? payload.name : undefined }
}
