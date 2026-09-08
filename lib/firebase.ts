import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBzGbUCalqX9XQXgoHRCgZ0aybBYofkf3c",
  authDomain: "estadia11bidgs2026.firebaseapp.com",
  projectId: "estadia11bidgs2026",
  storageBucket: "estadia11bidgs2026.firebasestorage.app",
  messagingSenderId: "564557275252",
  appId: "1:564557275252:web:666922556ad3ac5b9d3121",
  measurementId: "G-TL1LRGKVHY"
};

// Evitar la inicialización múltiple en desarrollo (Next.js Fast Refresh)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Cargar analytics de forma segura solo del lado del cliente (evita errores en SSR)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
