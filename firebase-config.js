// ============================================================
//  CONFIGURACIÓN DE FIREBASE
// ============================================================
//  Pega aquí la configuración de TU proyecto Firebase.
//  La consigues en: Consola Firebase > Configuración del proyecto
//  (icono engranaje) > "Tus apps" > icono </> (Web) > firebaseConfig
//
//  Estas claves NO son secretas: se pueden publicar en GitHub.
//  La seguridad real la dan las REGLAS de Firestore (firestore.rules)
//  y el login del panel de administración.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAKjxwOts0qOLOFfQhzdfkQk5r4GWwsxSo",
  authDomain: "buzon-sugerencias-15337.firebaseapp.com",
  projectId: "buzon-sugerencias-15337",
  storageBucket: "buzon-sugerencias-15337.firebasestorage.app",
  messagingSenderId: "146935632686",
  appId: "1:146935632686:web:37e997efc754aba72da0bf"
};

// No modifiques nada debajo de esta línea.
window.__FIREBASE_CONFIG__ = firebaseConfig;
