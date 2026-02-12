// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, remove, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ==========================================================
// CONFIGURAÇÃO CONECTADA AO SEU PROJETO
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyDqRq9Z1IsDOF6lG3kwyqD9T1eUijfhJh8",
  authDomain: "lisboa-direitometro.firebaseapp.com",
  databaseURL: "https://lisboa-direitometro-default-rtdb.firebaseio.com",
  projectId: "lisboa-direitometro",
  storageBucket: "lisboa-direitometro.firebasestorage.app",
  messagingSenderId: "198574297065",
  appId: "1:198574297065:web:7fbc7a5cc9ea72b0a9c578"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- CONFIGURAÇÕES GERAIS ---
const TODAY = new Date().toISOString().split('T')[0];
const ADMIN_USER = "ADMIN";
const ADMIN_PASS = "#"; // Senha Mestra

// --- LISTA ROBUSTA DE EMOJIS (+120 opções) ---
const EMOJIS = [
  // Reações Clássicas
  "😂","❤️","🔥","💀","🤡","💩","🤣","😭","🥰","😍",
  "👍","👎","👏","🙏","💪","👀","🥱","🙄","😡","🤬",
  "🤮","🤢","🤧","😷","🤒","🤕","🤑","🤠","😈","👿",
  "👻","👽","🤖","🎃","😺","🙈","🙉","🙊","💋","👋",
  
  // Sentimentos & Gestos
  "🫶","🤝","✌️","🤘","🤙","🤌","🤏","🖕","💅","💃",
  "🕺","🧘","🤦","🤷","🙆","🙅","🙇","🥺","🥹","😤",
  "🤯","🫠","🫡","🤫","🫣","🤔","🤨","😐","😑","😶",
  
  // Objetos & Status
  "👑","🏆","🥇","🥈","🥉","💎","💍","💰","💸","💳",
  "💡","💣","🔪","🔫","🛡️","💊","💉","🚬","⚰️","🪦",
  "🚀","🛸","⚓","🗺️","🗿","🎮","🎲","🎱","🎭","🎨",
  
  // Comida & Bebida
  "🍺","🍻","🍷","🥂","🥃","🍸","🍹","☕","🍼","🍕",
  "🍔","🍟","🌭","🍿","🥓","🥩","🍗","🍖","🦴","🧀",
  "🥞","🧇","🥨","🥯","🥖","🥐","🍞","🌰","🥜","🍄",
  
  // Natureza & Animais
  "🦁","🐯","🐶","🐺","🐻","🐼","🐨","🐷","🐮","🐔",
  "🐵","🐸","🐲","🦄","🐝","🦋","🐞","🕷️","🐍","🐢",
  "🌹","🥀","🌺","🌻","🌼","🌷","🌱","🌲","🌳","🌴",
  
  // Corações & Símbolos
  "💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘",
  "💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎",
  "☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍",
  "♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️",
  "☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚",
  "💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️",
  "🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫",
  "💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭"
];

// Variáveis Globais (Sincronizadas)
let globalUsers = {};
let globalVotes = {};
let currentTargetUser = null;

// Elementos DOM
const el = {
  header: { bar: document.getElementById("app-header"), msg: document.getElementById("welcome-msg"), btn: document.getElementById("settings-btn") },
  login: { card: document.getElementById("login"), btn: document.getElementById("loginBtn"), user: document.getElementById("username"), pass: document.getElementById("password"), error: document.getElementById("loginError") },
  vote: { card: document.getElementById("voting-area"), list: document.getElementById("users-to-vote"), count: document.getElementById("pending-count") },
  results: { card: document.getElementById("results-area"), list: document.getElementById("results-list"), refreshBtn: document.getElementById("refresh-btn"), logoutBtn: document.getElementById("logout-btn") },
  modal: { overlay: document.getElementById("emoji-modal"), title: document.getElementById("modal-title"), grid: document.getElementById("emoji-grid"), close: document.getElementById("close-modal") },
  settings: { overlay: document.getElementById("settings-modal"), title: document.getElementById("settings-title"), normalArea: document.getElementById("normal-user-settings"), adminArea: document.getElementById("admin-user-list"), newPass: document.getElementById("new-password"), saveBtn: document.getElementById("save-pass-btn"), deleteBtn: document.getElementById("delete-account-btn"), closeBtn: document.getElementById("close-settings") }
};

// ============================================================
// REALTIME LISTENERS (Sincronização Automática)
// ============================================================
// Ouve mudanças nos usuários em tempo real
onValue(ref(database, 'users'), (snapshot) => {
  globalUsers = snapshot.val() || {};
  refreshInterface();
});

// Ouve mudanças nos votos em tempo real
onValue(ref(database, 'votes'), (snapshot) => {
  globalVotes = snapshot.val() || {};
  refreshInterface();
});

function refreshInterface() {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (currentUser) {
    if (currentUser === ADMIN_USER) {
      showResults(); 
      if (!el.settings.overlay.classList.contains("hidden")) renderAdminUserList();
    } else {
      checkVotingStatus();
    }
  }
}

// ============================================================
// LÓGICA DE LOGIN
// ============================================================
el.login.btn.addEventListener("click", async () => {
  const user = el.login.user.value.trim();
  const pass = el.login.pass.value.trim();
  el.login.error.textContent = "";

  if (!user || pass.length !== 1) { el.login.error.textContent = "Nome e senha (1 char) obrigatórios."; return; }

  // ADMIN LOGIN
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem("qm_logged", ADMIN_USER);
    initApp();
    return;
  }

  // USUÁRIO COMUM
  if (globalUsers[user]) {
    if (globalUsers[user] !== pass) { el.login.error.textContent = "Senha incorreta."; return; }
  } else {
    // Cadastro Novo
    if (user.toUpperCase() === ADMIN_USER) { el.login.error.textContent = "Nome reservado."; return; }
    if (Object.values(globalUsers).includes(pass)) { el.login.error.textContent = "Caractere indisponível."; return; }
    
    // Salva no Firebase (Isso envia para a nuvem!)
    await set(ref(database, 'users/' + user), pass);
  }

  sessionStorage.setItem("qm_logged", user);
  initApp();
});

function initApp() {
  const user = sessionStorage.getItem("qm_logged");
  if (!user) { el.header.bar.classList.add("hidden"); return; }

  el.login.card.classList.add("hidden");
  el.header.bar.classList.remove("hidden");
  
  if (user === ADMIN_USER) {
    el.header.msg.innerHTML = "⚡ Painel Admin";
    showResults();
  } else {
    el.header.msg.textContent = `Olá, ${user}`;
    checkVotingStatus();
  }
}

// ============================================================
// VOTAÇÃO
// ============================================================
function checkVotingStatus() {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (!currentUser || currentUser === ADMIN_USER) return;

  const allUsers = Object.keys(globalUsers);
  const votesToday = globalVotes[TODAY] || {};
  const myVotes = votesToday[currentUser] || {};
  const toVote = allUsers.filter(u => u !== currentUser && u !== ADMIN_USER && !myVotes[u]);

  if (toVote.length === 0) showResults();
  else showVotingList(toVote);
}

function showVotingList(pendingUsers) {
  el.vote.card.classList.remove("hidden");
  el.results.card.classList.add("hidden");
  el.vote.list.innerHTML = "";
  el.vote.count.textContent = `Faltam ${pendingUsers.length} para julgar.`;

  pendingUsers.forEach(target => {
    const btn = document.createElement("button");
    btn.className = "user-to-vote-btn"; 
    btn.innerHTML = `<span>Votar em <strong>${target}</strong></span> <span>👉</span>`;
    btn.onclick = () => openModal(target);
    el.vote.list.appendChild(btn);
  });
}

function openModal(targetName) {
  currentTargetUser = targetName;
  el.modal.title.textContent = `Defina ${targetName}:`;
  el.modal.grid.innerHTML = "";
  EMOJIS.forEach(emoji => {
    const btn = document.createElement("button");
    btn.textContent = emoji; btn.className = "emoji-option";
    btn.onclick = (e) => { e.stopPropagation(); confirmVote(emoji); };
    el.modal.grid.appendChild(btn);
  });
  el.modal.overlay.classList.remove("hidden");
}

el.modal.close.onclick = () => { el.modal.overlay.classList.add("hidden"); currentTargetUser = null; }

async function confirmVote(emoji) {
  if (!currentTargetUser) return;
  const currentUser = sessionStorage.getItem("qm_logged");
  // Envia voto para a nuvem
  await set(ref(database, `votes/${TODAY}/${currentUser}/${currentTargetUser}`), emoji);
  el.modal.overlay.classList.add("hidden");
  currentTargetUser = null;
}

// ============================================================
// RESULTADOS
// ============================================================
function showResults() {
  el.vote.card.classList.add("hidden");
  el.results.card.classList.remove("hidden");
  
  const votesToday = globalVotes[TODAY] || {};
  const summary = {}; 

  Object.values(votesToday).forEach(userVotes => {
    Object.entries(userVotes).forEach(([target, emoji]) => {
      if (!summary[target]) summary[target] = [];
      summary[target].push(emoji);
    });
  });

  el.results.list.innerHTML = "";
  const allUsers = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);

  if (allUsers.length === 0) { el.results.list.innerHTML = "<p>Nenhum participante.</p>"; return; }

  allUsers.forEach(user => {
    const received = summary[user] || [];
    const div = document.createElement("div"); div.className = "result-item"; 
    if (received.length === 0) {
      div.innerHTML = `<strong>${user}</strong>: Aguardando votos...`;
    } else {
      const counts = {}; received.forEach(e => counts[e] = (counts[e] || 0) + 1);
      const displayString = Object.entries(counts).sort((a, b) => b[1] - a[1])
        .map(([e, qtd]) => `${e} <small>x${qtd}</small>`).join("&nbsp;&nbsp;");
      div.innerHTML = `<strong>${user}</strong> recebeu: <br> ${displayString}`;
    }
    el.results.list.appendChild(div);
  });
}

// ============================================================
// CONFIGURAÇÕES & ADMIN
// ============================================================
el.header.btn.onclick = () => {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (currentUser === ADMIN_USER) {
    el.settings.title.textContent = "Admin - Usuários";
    el.settings.normalArea.classList.add("hidden");
    el.settings.adminArea.classList.remove("hidden");
    renderAdminUserList();
  } else {
    el.settings.title.textContent = "Meu Perfil";
    el.settings.normalArea.classList.remove("hidden");
    el.settings.adminArea.classList.add("hidden");
  }
  el.settings.overlay.classList.remove("hidden");
};
el.settings.closeBtn.onclick = () => el.settings.overlay.classList.add("hidden");

el.settings.saveBtn.onclick = async () => {
  const currentUser = sessionStorage.getItem("qm_logged");
  const newPass = el.settings.newPass.value.trim();
  if (newPass.length !== 1) { alert("Senha deve ter 1 caractere."); return; }
  const passTaken = Object.entries(globalUsers).some(([u, p]) => p === newPass && u !== currentUser);
  if (passTaken) { alert("Caractere indisponível."); return; }
  
  await set(ref(database, 'users/' + currentUser), newPass);
  alert("Salvo!"); el.settings.newPass.value = ""; el.settings.overlay.classList.add("hidden");
};

el.settings.deleteBtn.onclick = async () => {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (confirm(`Excluir conta de ${currentUser}?`)) {
    await remove(ref(database, 'users/' + currentUser));
    sessionStorage.removeItem("qm_logged"); location.reload();
  }
};

function renderAdminUserList() {
  const userNames = Object.keys(globalUsers);
  el.settings.adminArea.innerHTML = "";
  if (userNames.length === 0) { el.settings.adminArea.innerHTML = "<p>Vazio.</p>"; return; }

  userNames.forEach(user => {
    if(user === ADMIN_USER) return; 
    const div = document.createElement("div"); div.className = "admin-user-item";
    div.innerHTML = `<span>👤 ${user} (${globalUsers[user]})</span> <button class="danger-btn admin-delete-btn">Excluir</button>`;
    div.querySelector("button").onclick = async () => {
      if(confirm(`Banir ${user}?`)) await remove(ref(database, 'users/' + user));
    };
    el.settings.adminArea.appendChild(div);
  });
}

el.results.refreshBtn.onclick = () => location.reload();
el.results.logoutBtn.onclick = () => { sessionStorage.removeItem("qm_logged"); location.reload(); };

if (sessionStorage.getItem("qm_logged")) initApp();
