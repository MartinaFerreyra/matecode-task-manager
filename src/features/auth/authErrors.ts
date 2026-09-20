// Traduce los errores de Firebase Auth a mensajes claros para el usuario.
// Nunca se muestra el mensaje crudo de Firebase (viene en inglés y con detalles técnicos).

const MESSAGES: Record<string, string> = {
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "Por favor valida que el correo electrónico esté escrito correctamente.",
  "auth/missing-password": "Ingresá tu contraseña.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/email-already-in-use": "La dirección de correo electrónico ya se encuentra en uso.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos e intentá de nuevo.",
  "auth/network-request-failed": "No hay conexión. Revisá tu internet e intentá de nuevo.",
  "auth/user-disabled": "Esta cuenta fue deshabilitada.",
  "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar. Intentá de nuevo.",
  "auth/cancelled-popup-request": "Cerraste la ventana de Google antes de terminar. Intentá de nuevo.",
  "auth/popup-blocked": "Tu navegador bloqueó la ventana de Google. Permití los popups e intentá de nuevo.",
  "auth/account-exists-with-different-credential":
    "Ya existe una cuenta con ese correo usando otro método de acceso.",
}

const FALLBACK = "Ocurrió un error inesperado. Intentá de nuevo."

export function getAuthErrorMessage(err: unknown): string {
  const code = typeof err === "object" && err !== null && "code" in err ? String(err.code) : ""
  return MESSAGES[code] ?? FALLBACK
}
