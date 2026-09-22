/* ============================================================
   Buzón de Sugerencias — panel de administración (jefes)
   ============================================================ */

let db = null;
let auth = null;
let FIREBASE_READY = false;
let allMessages = [];
let currentFilter = "todos";

const TIPO_LABEL = { sugerencia: "💡 Sugerencia", queja: "⚠️ Queja", otro: "💬 Otro" };

/* ---------- Firebase ---------- */
function initFirebase() {
  const cfg = window.__FIREBASE_CONFIG__;
  if (!cfg || cfg.apiKey === "PEGA_AQUI_TU_API_KEY") {
    document.getElementById("loginError").textContent =
      "⚠ Falta configurar Firebase (firebase-config.js).";
    return false;
  }
  firebase.initializeApp(cfg);
  auth = firebase.auth();
  db = firebase.firestore();
  return true;
}

/* ---------- Fechas ---------- */
function fmtDate(ts) {
  if (!ts || !ts.toDate) return "Enviando...";
  const d = ts.toDate();
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

/* ---------- Login ---------- */
function showApp() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  startListener();
}

function showLogin() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  const btn = document.getElementById("loginBtn");
  btn.disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (err) {
    errEl.textContent = "Correo o contraseña incorrectos.";
  } finally {
    btn.disabled = false;
  }
}

/* ---------- Datos en tiempo real ---------- */
function startListener() {
  db.collection("buzon").orderBy("fecha", "desc").onSnapshot(
    (snap) => {
      allMessages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderAll();
    },
    (err) => console.error("Error leyendo mensajes:", err)
  );
}

function renderAll() {
  const total = allMessages.length;
  const unread = allMessages.filter(m => !m.leido).length;
  const quejas = allMessages.filter(m => m.tipo === "queja").length;
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statUnread").textContent = unread;
  document.getElementById("statQuejas").textContent = quejas;

  let list = allMessages;
  if (currentFilter === "no_leidos") list = list.filter(m => !m.leido);
  else if (currentFilter !== "todos") list = list.filter(m => m.tipo === currentFilter);

  const container = document.getElementById("msgList");
  const empty = document.getElementById("emptyState");

  if (list.length === 0) {
    container.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  container.innerHTML = list.map(m => {
    const imgs = (m.imagenes || []).map(src =>
      `<img src="${src}" data-full="${src}" class="lightbox-trigger" />`).join("");
    return `
      <div class="msg-card ${m.leido ? "" : "unread"} tipo-${m.tipo}">
        <div class="msg-top">
          <span class="msg-badge">${TIPO_LABEL[m.tipo] || m.tipo}</span>
          <span class="msg-date">${fmtDate(m.fecha)}</span>
        </div>
        <p class="msg-text">${escapeHtml(m.mensaje)}</p>
        ${imgs ? `<div class="msg-images">${imgs}</div>` : ""}
        <div class="msg-actions">
          <button class="primary" data-action="toggle" data-id="${m.id}">
            ${m.leido ? "Marcar sin leer" : "Marcar leído"}
          </button>
          <button class="danger" data-action="delete" data-id="${m.id}">Eliminar</button>
        </div>
      </div>`;
  }).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/* ---------- Acciones ---------- */
async function toggleLeido(id) {
  const m = allMessages.find(x => x.id === id);
  if (!m) return;
  await db.collection("buzon").doc(id).update({ leido: !m.leido });
}

async function deleteMsg(id) {
  if (!confirm("¿Eliminar este mensaje permanentemente?")) return;
  await db.collection("buzon").doc(id).delete();
}

/* ---------- Lightbox ---------- */
function openLightbox(src) {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `<img src="${src}" />`;
  box.addEventListener("click", () => box.remove());
  document.body.appendChild(box);
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  FIREBASE_READY = initFirebase();
  if (!FIREBASE_READY) return;

  auth.onAuthStateChanged(user => user ? showApp() : showLogin());

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());

  document.getElementById("filterRow").addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    currentFilter = chip.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    renderAll();
  });

  document.getElementById("msgList").addEventListener("click", (e) => {
    const lightboxImg = e.target.closest(".lightbox-trigger");
    if (lightboxImg) { openLightbox(lightboxImg.dataset.full); return; }

    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "toggle") toggleLeido(id);
    else if (btn.dataset.action === "delete") deleteMsg(id);
  });
});
