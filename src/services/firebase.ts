import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from 'firebase/auth';


const PROVIDER_GOOGLE = new GoogleAuthProvider();

// Config de Firebase leída desde variables de entorno (.env),
// no hardcodeada en el código.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export function loginGoogle() {
    const auth = getAuth()
    signInWithPopup(auth, PROVIDER_GOOGLE)
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.log(error);
        });
}

export const onChangeUser = (setUsuario) => {
    const auth = getAuth()
    return onAuthStateChanged(auth, (user) => {
        const usuario = user
            ? {
                uid: user.uid,
                email: user.email,
                nombre: user.displayName || user.email,
                foto: user.photoURL,
            }
            : null
        setUsuario(usuario)
    })
}
export const auth = getAuth(app);

export const db = getFirestore(app);
export const onSignOut = () => {
    signOut(auth);
};

export const registroUsuario = (formData, setFormData) => {

    if (!formData.email || !formData.password) {
        return;
    }

    createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
    )
        .then((result) => {
            console.log(result);
        })
        .catch((err) => setFormData({ ...formData, error: handleError(err.code, err.message) }))
};

export const loginUsuario = (formData, setFormData) => {

    if (!formData.email || !formData.password) {
        return;
    }

    signInWithEmailAndPassword(auth, formData.email, formData.password)
        .then((result) => console.log(result))
        .catch((err) => setFormData({ ...formData, error: handleError(err.code, err.message) }))

};

export const recuperarPassword = async (email) => {
    if (!email) {
        return { ok: false, error: "Ingresá tu correo electrónico." }
    }
    try {
        await sendPasswordResetEmail(auth, email)
        return { ok: true, error: null }
    } catch (err) {
        return { ok: false, error: handleError(err.code, err.message) }
    }
}

function handleError(code, message) {
    switch (code) {
        case "auth/wrong-password":
            return "Correo o contraseña incorrectos."
        case "auth/user-not-found":
            return "Correo o contraseña incorrectos."
        case "auth/invalid-credential":
            return "Correo o contraseña incorrectos."
        case "auth/invalid-email":
            return "Por favor valida que el correo electrónico este escrito correctamente."
        case "auth/weak-password":
            return "La contraseña debe tener al menos 6 caracteres."
        case "auth/email-already-in-use":
            return "la dirección de correo electrónico ya se encuentra en uso."
        default:
            return message
    }
}