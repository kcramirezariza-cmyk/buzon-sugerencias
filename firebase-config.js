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
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "PEGA_AQUI.firebaseapp.com",
  projectId: "PEGA_AQUI",
  storageBucket: "PEGA_AQUI.firebasestorage.app",
  messagingSenderId: "PEGA_AQUI",
  appId: "PEGA_AQUI"
};

// No modifiques nada debajo de esta línea.
window.__FIREBASE_CONFIG__ = firebaseConfig;
