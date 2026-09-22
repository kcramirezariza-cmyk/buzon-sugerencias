/* ============================================================
   Buzón de Sugerencias — formulario público (anónimo)
   ============================================================ */

const MAX_IMAGENES = 3;
let selectedFiles = [];   // [{file, dataUrl}]
let tipoActual = "sugerencia";
let db = null;
let auth = null;
let FIREBASE_READY = false;

/* ---------- Firebase ---------- */
function initFirebase() {
  const cfg = window.__FIREBASE_CONFIG__;
  if (!cfg || cfg.apiKey === "PEGA_AQUI_TU_API_KEY") {
    setMsg("⚠ Falta configurar Firebase (firebase-config.js). El formulario no puede enviarse todavía.", false);
    return false;
  }
  if (typeof firebase === "undefined") {
    setMsg("⚠ No cargaron las librerías. Revisa tu conexión a internet.", false);
    return false;
  }
  firebase.initializeApp(cfg);
  auth = firebase.auth();
  db = firebase.firestore();
  return true;
}

/* ---------- Utilidades de imagen ---------- */
function compressImage(file, maxW = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Imagen inválida"));
    img.src = URL.createObjectURL(file);
  });
}

function renderPreviews() {
  const grid = document.getElementById("previewGrid");
  grid.innerHTML = "";
  selectedFiles.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.innerHTML = `<img src="${item.dataUrl}" alt="Foto ${i + 1}" />
      <button type="button" class="preview-remove" data-i="${i}" aria-label="Quitar foto">✕</button>`;
    grid.appendChild(div);
  });
  grid.querySelectorAll(".preview-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedFiles.splice(Number(btn.dataset.i), 1);
      renderPreviews();
      updateUploadState();
    });
  });
}

function updateUploadState() {
  const label = document.getElementById("uploadBtnLabel");
  const input = document.getElementById("fotoInput");
  const full = selectedFiles.length >= MAX_IMAGENES;
  label.classList.toggle("disabled", full);
  input.disabled = full;
  label.textContent = full ? "📷 Máximo 3 imágenes" : "📷 Elegir de la galería";
}

async function handleFileSelect(e) {
  const files = Array.from(e.target.files || []);
  e.target.value = ""; // permite volver a elegir el mismo archivo
  for (const file of files) {
    if (selectedFiles.length >= MAX_IMAGENES) break;
    if (!file.type.startsWith("image/")) continue;
    try {
      const dataUrl = await compressImage(file);
      selectedFiles.push({ file, dataUrl });
    } catch (err) {
      console.warn("No se pudo procesar una imagen", err);
    }
  }
  renderPreviews();
  updateUploadState();
}

/* ---------- UI ---------- */
function setMsg(text, ok) {
  const el = document.getElementById("formMsg");
  el.textContent = text || "";
  el.classList.toggle("ok", !!ok);
}

function selectTipo(tipo) {
  tipoActual = tipo;
  document.querySelectorAll(".tipo-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tipo === tipo);
  });
}

function setSubmitting(isSubmitting) {
  const btn = document.getElementById("submitBtn");
  const text = document.getElementById("submitBtnText");
  btn.disabled = isSubmitting;
  text.textContent = isSubmitting ? "Enviando..." : "Enviar de forma anónima";
}

function showSuccess() {
  document.getElementById("formScreen").classList.add("hidden");
  document.getElementById("successScreen").classList.remove("hidden");
}

function resetForm() {
  document.getElementById("buzonForm").reset();
  selectedFiles = [];
  renderPreviews();
  updateUploadState();
  selectTipo("sugerencia");
  document.getElementById("charCount").textContent = "0";
  setMsg("", false);
  document.getElementById("successScreen").classList.add("hidden");
  document.getElementById("formScreen").classList.remove("hidden");
}

/* ---------- Envío ---------- */
async function submitForm(e) {
  e.preventDefault();
  setMsg("", false);

  // Honeypot: si un bot llenó este campo oculto, fingimos éxito y no enviamos nada.
  const honeypot = document.getElementById("website").value.trim();
  if (honeypot) {
    showSuccess();
    return;
  }

  const mensaje = document.getElementById("mensaje").value.trim();
  if (!mensaje) {
    setMsg("Escribe tu mensaje antes de enviar.");
    return;
  }
  if (mensaje.length > 3000) {
    setMsg("El mensaje es demasiado largo (máximo 3000 caracteres).");
    return;
  }
  if (!FIREBASE_READY) {
    setMsg("⚠ El buzón no está conectado todavía. Avisa al administrador.");
    return;
  }

  setSubmitting(true);
  try {
    if (!auth.currentUser) {
      await auth.signInAnonymously();
    }
    await db.collection("buzon").add({
      tipo: tipoActual,
      mensaje,
      imagenes: selectedFiles.map(f => f.dataUrl),
      leido: false,
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showSuccess();
  } catch (err) {
    console.error(err);
    setMsg("No se pudo enviar. Revisa tu conexión e intenta de nuevo.");
  } finally {
    setSubmitting(false);
  }
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  FIREBASE_READY = initFirebase();

  document.getElementById("tipoSelector").addEventListener("click", (e) => {
    const btn = e.target.closest(".tipo-btn");
    if (btn) selectTipo(btn.dataset.tipo);
  });

  document.getElementById("mensaje").addEventListener("input", (e) => {
    document.getElementById("charCount").textContent = e.target.value.length;
  });

  document.getElementById("fotoInput").addEventListener("change", handleFileSelect);
  document.getElementById("buzonForm").addEventListener("submit", submitForm);
  document.getElementById("sendAnotherBtn").addEventListener("click", resetForm);

  updateUploadState();
});
