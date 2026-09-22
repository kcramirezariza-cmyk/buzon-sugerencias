# 📮 Buzón de Sugerencias (anónimo)

Página web donde tus colaboradoras envían sugerencias, quejas o comentarios
**totalmente anónimos** (con fotos opcionales desde su celular), y un panel
privado donde los jefes leen y gestionan los mensajes. Se publica gratis en
**GitHub Pages** y guarda los datos en **Firebase**.

## ✨ Qué hace

- **Formulario público** (`index.html`): sin login, sin pedir nombre ni correo.
  Optimizado para celular: elegir tipo (Sugerencia / Queja / Otro), escribir
  el mensaje y adjuntar hasta 3 fotos desde la galería del teléfono.
- **Panel privado** (`admin.html`): solo los jefes entran (con correo y
  contraseña). Ahí ven todos los mensajes en tiempo real, los filtran, los
  marcan como leídos y pueden borrarlos.
- No se guarda IP, ni nombre, ni ningún dato de quien envía el mensaje.

---

## 🚀 Instalación (una sola vez, ~10 minutos)

### 1. Crear el proyecto en Firebase
1. Entra a <https://console.firebase.google.com> y crea un proyecto (gratis).
2. En el menú **Compilación**, activa:
   - **Authentication** → pestaña *Sign-in method* → habilita **Correo/contraseña**
     (para el panel de jefes) y **Anónimo** (para que ellas puedan enviar mensajes).
   - **Firestore Database** → *Crear base de datos* → modo producción → elige
     la región más cercana (ej. `nam5`).

> 📷 Las fotos se guardan comprimidas dentro del mensaje (Firestore). No hace
> falta activar Storage ni ningún plan de pago.

### 2. Crear el usuario de los jefes
1. En **Authentication → Users → Add user**.
2. Pon el correo y contraseña con la que los jefes van a entrar al panel
   (`admin.html`). Puedes crear uno por cada jefe si quieres.

### 3. Pegar la configuración
1. En **Configuración del proyecto** (engranaje) → *Tus apps* → icono **`</>`**
   (Web) → registra la app.
2. Copia el objeto `firebaseConfig` y pégalo en el archivo **`firebase-config.js`**.

### 4. Publicar las reglas de seguridad
- **Firestore → Reglas**: pega el contenido de `firestore.rules` y publica.
- Estas reglas permiten que **cualquiera** pueda enviar un mensaje nuevo (sin
  login), pero **solo un jefe con sesión iniciada** puede leer, marcar como
  leído o borrar mensajes.

### 5. Subir a GitHub Pages
1. Crea un repositorio en GitHub y sube todos estos archivos.
2. En el repo: **Settings → Pages → Source: `main` / carpeta raíz (`/root`)** → guarda.
3. En unos minutos tendrás dos URLs públicas:
   - `https://tuusuario.github.io/tu-repo/` → **formulario anónimo** (el link
     que compartes con tus colaboradoras).
   - `https://tuusuario.github.io/tu-repo/admin.html` → **panel de jefes**
     (guárdalo aparte, no lo compartas con todo el mundo).

> **Importante:** en **Authentication → Settings → Dominios autorizados**,
> agrega tu dominio de GitHub Pages (`tuusuario.github.io`) para que el login
> del panel funcione ahí.

---

## 📲 Cómo lo usan tus colaboradoras

1. Les compartes el link del formulario (por WhatsApp, por ejemplo).
2. Lo abren desde el celular, escriben su mensaje, opcionalmente agregan
   fotos de la galería, y dan **Enviar**.
3. Listo. No queda ningún dato de quién lo mandó.

## 📁 Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | Formulario público y anónimo (para colaboradoras) |
| `admin.html` | Panel privado de lectura (para jefes) |
| `styles.css` | Diseño de ambas páginas |
| `app.js` | Lógica del formulario público |
| `admin.js` | Lógica del panel de administración |
| `firebase-config.js` | Tus claves de Firebase (edítalo) |
| `firestore.rules` | Reglas de seguridad de la base de datos |

## 🔒 Sobre el anonimato

El formulario no pide nombre, correo ni ningún dato personal, y el código no
guarda IP ni identificador del dispositivo. La sesión "anónima" de Firebase
(`signInAnonymously`) es solo un requisito técnico para poder escribir en la
base de datos — no identifica a la persona ni queda visible para los jefes.
