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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- GERAIS ---
const TODAY = new Date().toISOString().split('T')[0];
const ADMIN_USER = "ADMIN";
const ADMIN_PASS = "#"; 

// --- EMOJIS ---
const POSITIVE_EMOJIS = [
  "❤️","🔥","👍","🥰","😍","👏","🙏","💪","🎉","😁","💕","☺️","👑","🏆","🥇","💎",
  "💰","🚀","😎","✨","💖","💯","🌹","🫶","🤝","✌️","🤘","🤙","🛡️","😇","✅",
  "🫡","🧠","🌟","🥂","🐐","🎩","🔋","🔝","🪄","💍","🦅","🦁","🌞","💡",
  "🤩","🥳","😻","😽","💝","💗","💓","💞","💟","💐","🌸","💮","🏵️","🎖️","🏅", "🗿",
  "🥈","🥉","🎫","🎇","🎆","🆙","🆒","🆗","🛐","🧜‍♂️","🧞‍♂️","🦸","🧚","👼","👰",
  "🤱","🍄","🐚","🐾","🌷","🌺","🌻","🌼","🌽","🥕","🥒", "🍆", "🍑", "🐱","🥺"
];

const NEGATIVE_EMOJIS = [
  "😂","🤣","😭","💀","🤡","💩","👎","👀","🥱","🙄","😡","🤬","🤮","🤢","🤧","😷","🐸", "🤰",
  "🤕","🤑","🤠","😈","👿","👻","👽","🖕","🤦","🤷","😤","💔","🥀","🆘","❌","⛔","🚫",
  "🐍","🐀","🐷","🐮","🐔","🐛","🦗","🦂","🗑️","🚮","📉","🚩","🤥","🤫","🦶","🍼","🌚", "🐶",
  "😒","😞","😔","😟","😕","☹️","😣","😖","😫","😩","🦟","🐜","🐌","🪳","🌈", "🍿", "🍌","🍀",
  "🧻","🚽","🪠","🧟","🧛","👺","👹","🏚️","⚰️","🪦","🚬","🦠","🩸","🩹","🪓","💣","🥬","🥦",
  "🧨","🔪","🔫","🔨","📉","🔇","🔕","🌧️","⛈️","🌩️","🌨️","🌪️","🌫️", "🌵","🌲","🌳","🌴","🐳",
  "🌵","🌲","🌳","🌴","🍀","🥬","🥦","🌹","🍄","🌷","🌺","🌻","🌼","🌽","🥕","🥒","🍆","🍑",
  "💐","🌸","💮","🏵️","🪴","🌱","🌿","🍃"
];

const NEUTRAL_EMOJIS = [
  "🍔","🍕","🍺","🍻","🍷","☕","🎮","🎲","🎨","✈️","🏖️","🎵",
  "🚗","🚲","📷","⌚","📱","💻","⚽","🏀","🎾","🎸",
  "☁️","🎃","🤖","👾","🧸","🎈","🔮","🧬","💊","🛸","🐨","🐼",
  "🐰","🐹","🦊","🦄","🐝","🐞","🐢","🐙","🐠","🐟","🐬","🦈",
  "🍏","🍎","🍐","🍊","🍋","🍉","🍇","🍓","🍈","🍒","🍍","🥥","🥝",
  "🍅","🥑","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🥞","🥓","🥩",
  "🍗","🍖","🌭","🥪","🌮","🌯","🥙","🥗","🥘","🥫","🧂","🍝","🍜","🍲","🍛",
  "🍣","🍱","🥟","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦",
  "🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍩","🍪","🍯","🥛","🍵","🍶","🍾"
];
const EMOJIS = [...POSITIVE_EMOJIS, ...NEGATIVE_EMOJIS, ...NEUTRAL_EMOJIS];

// --- PERGUNTAS DA INTRIGA ---
const INTRIGUE_QUESTIONS = [
  { q: "Em um apocalipse zumbi:", a: "Sobrevive", b: "Morre Primeiro" },
  { q: "Quem tem mais chance de ser preso?", a: "Inocente", b: "Culpado" },
  { q: "Quem seria cancelado na internet?", a: "Cancelado", b: "Amado" },
  { q: "Num filme de terror:", a: "O Assassino", b: "A Vítima" },
  { q: "Quem gastaria todo o dinheiro da Mega Sena?", a: "Investidor", b: "Falido" },
  { q: "Quem chora no banho?", a: "Chora", b: "Nem liga" },
  { q: "Quem é mais provável de virar político?", a: "Político", b: "Eleitor" }
];

// VARIÁVEIS GLOBAIS
let globalUsers = {};
let globalVotes = {};
let globalIntrigue = {};
let currentTargetUser = null;

// ELEMENTOS DOM
const el = {
  header: { bar: document.getElementById("app-header"), msg: document.getElementById("welcome-msg"), btn: document.getElementById("settings-btn") },
  login: { card: document.getElementById("login"), btn: document.getElementById("loginBtn"), user: document.getElementById("username"), pass: document.getElementById("password"), error: document.getElementById("loginError") },
  intrigue: { card: document.getElementById("intrigue-area"), waiting: document.getElementById("intrigue-waiting"), play: document.getElementById("intrigue-play"), result: document.getElementById("intrigue-result"), question: document.getElementById("intrigue-question"), inputs: document.getElementById("intrigue-inputs"), submit: document.getElementById("submit-intrigue-btn") },
  vote: { card: document.getElementById("voting-area"), list: document.getElementById("users-to-vote"), count: document.getElementById("pending-count") },
  results: { card: document.getElementById("results-area"), list: document.getElementById("results-list"), refreshBtn: document.getElementById("refresh-btn"), logoutBtn: document.getElementById("logout-btn") },
  modal: { overlay: document.getElementById("emoji-modal"), title: document.getElementById("modal-title"), grid: document.getElementById("emoji-grid"), close: document.getElementById("close-modal") },
  settings: { overlay: document.getElementById("settings-modal"), title: document.getElementById("settings-title"), normalArea: document.getElementById("normal-user-settings"), adminArea: document.getElementById("admin-user-list"), newPass: document.getElementById("new-password"), saveBtn: document.getElementById("save-pass-btn"), deleteBtn: document.getElementById("delete-account-btn"), closeBtn: document.getElementById("close-settings") }
};

// ============================================================
// LISTENERS
// ============================================================
onValue(ref(database, 'users'), (snap) => { globalUsers = snap.val() || {}; refreshInterface(); });
onValue(ref(database, 'votes'), (snap) => { globalVotes = snap.val() || {}; refreshInterface(); });
onValue(ref(database, `intrigue/${TODAY}`), (snap) => { globalIntrigue = snap.val() || {}; refreshInterface(); });

function refreshInterface() {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (currentUser) {
    if (currentUser === ADMIN_USER) {
      showResults(); 
      if (!el.settings.overlay.classList.contains("hidden")) renderAdminUserList();
    } else {
      processIntrigue();
      checkVotingStatus();
    }
  }
}

// ============================================================
// LOGIN
// ============================================================
el.login.btn.addEventListener("click", async () => {
  const user = el.login.user.value.trim();
  const pass = el.login.pass.value.trim();
  el.login.error.textContent = "";

  if (!user || pass.length !== 1) { el.login.error.textContent = "Nome e senha (1 char) obrigatórios."; return; }

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem("qm_logged", ADMIN_USER);
    initApp(); return;
  }

  if (globalUsers[user]) {
    if (globalUsers[user] !== pass) { el.login.error.textContent = "Senha incorreta."; return; }
  } else {
    if (user.toUpperCase() === ADMIN_USER) { el.login.error.textContent = "Reservado."; return; }
    if (Object.values(globalUsers).includes(pass)) { el.login.error.textContent = "Indisponível."; return; }
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
    refreshInterface();
  }
}

// ============================================================
// INTRIGA (NOVA FUNCIONALIDADE)
// ============================================================
function processIntrigue() {
  const currentUser = sessionStorage.getItem("qm_logged");
  const users = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);
  
  // Precisa de pelo menos 2 pessoas
  if (users.length < 2) { el.intrigue.card.classList.add("hidden"); return; }
  el.intrigue.card.classList.remove("hidden");

  // Sorteia Juiz (Baseado no dia para ser fixo)
  const dayHash = TODAY.split('-').reduce((a,b) => parseInt(a)+parseInt(b), 0);
  const judgeIndex = dayHash % users.length;
  const judgeName = users[judgeIndex];

  el.intrigue.waiting.classList.add("hidden");
  el.intrigue.play.classList.add("hidden");
  el.intrigue.result.classList.add("hidden");

  // CASO 1: Já tem resultado
  if (globalIntrigue.verdict) {
    el.intrigue.result.classList.remove("hidden");
    const q = globalIntrigue.qData;
    document.getElementById("res-question").innerText = q.q;
    document.getElementById("res-judge").innerText = judgeName;
    document.getElementById("label-a").innerText = q.a;
    document.getElementById("label-b").innerText = q.b;
    
    const listA = document.getElementById("list-a");
    const listB = document.getElementById("list-b");
    listA.innerHTML = ""; listB.innerHTML = "";
    
    Object.entries(globalIntrigue.verdict).forEach(([u, val]) => {
      const span = document.createElement("div"); 
      span.innerText = u; span.style.marginBottom="2px";
      if (val === "A") listA.appendChild(span);
      else listB.appendChild(span);
    });
    return;
  }

  // CASO 2: Eu sou o Juiz
  if (currentUser === judgeName) {
    el.intrigue.play.classList.remove("hidden");
    const qIndex = dayHash % INTRIGUE_QUESTIONS.length;
    const q = INTRIGUE_QUESTIONS[qIndex];
    
    el.intrigue.question.innerText = q.q;
    el.intrigue.inputs.innerHTML = "";
    
    users.forEach(u => {
      if (u === currentUser) return;
      const row = document.createElement("div");
      row.style.display = "flex"; row.style.justifyContent = "space-between";
      row.innerHTML = `<span>${u}</span> <select id="sel-${u}"><option value="A">${q.a}</option><option value="B">${q.b}</option></select>`;
      el.intrigue.inputs.appendChild(row);
    });

    el.intrigue.submit.onclick = async () => {
      const verdict = {};
      users.forEach(u => {
        if (u !== currentUser) verdict[u] = document.getElementById(`sel-${u}`).value;
      });
      await set(ref(database, `intrigue/${TODAY}`), { verdict, qData: q });
    };

  } else {
    // CASO 3: Esperando
    el.intrigue.waiting.classList.remove("hidden");
    document.getElementById("judge-name").innerText = judgeName;
  }
}

// ============================================================
// VOTAÇÃO
// ============================================================
function checkVotingStatus() {
  const currentUser = sessionStorage.getItem("qm_logged");
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
  await set(ref(database, `votes/${TODAY}/${currentUser}/${currentTargetUser}`), emoji);
  el.modal.overlay.classList.add("hidden");
  currentTargetUser = null;
}

// ============================================================
// RESULTADOS & LANTERNA EXPOSED
// ============================================================
function showResults() {
  el.vote.card.classList.add("hidden");
  el.results.card.classList.remove("hidden");
  
  const votesToday = globalVotes[TODAY] || {};
  const lanternExposed = votesToday.lanternExposed || false;
  
  let ranking = [];
  const allUsers = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);

  if (allUsers.length === 0) { el.results.list.innerHTML = "<p>Nenhum participante.</p>"; return; }

  // Calcula Pontuação
  allUsers.forEach(user => {
    let score = 0;
    let receivedData = []; // { emoji, from }

    Object.entries(votesToday).forEach(([voterKey, userVotes]) => {
      if (!globalUsers[voterKey] && voterKey !== ADMIN_USER) return;
      if (voterKey === "lanternExposed") return; // Ignora chave de controle

      const emoji = userVotes[user];
      if (emoji) {
        receivedData.push({ emoji, from: voterKey });
        if (POSITIVE_EMOJIS.includes(emoji)) score++;
        else if (NEGATIVE_EMOJIS.includes(emoji)) score--;
      }
    });
    ranking.push({ name: user, score, details: receivedData });
  });

  ranking.sort((a, b) => b.score - a.score);
  
  let targetName = null;
  if (ranking.length > 0) targetName = ranking[ranking.length - 1].name;

  el.results.list.innerHTML = "";
  const currentUser = sessionStorage.getItem("qm_logged");

  ranking.forEach((userData, index) => {
    const div = document.createElement("div"); 
    div.className = "result-item"; 
    
    let scoreClass = "score-neu";
    let scoreSign = "";
    if (userData.score > 0) { scoreClass = "score-pos"; scoreSign = "+"; }
    else if (userData.score < 0) { scoreClass = "score-neg"; }

    const isTarget = (userData.name === targetName);
    if (isTarget) div.classList.add("target-of-the-day");

    // Lógica de Exibição
    const displayHTML = userData.details.map(d => {
      const isNegative = NEGATIVE_EMOJIS.includes(d.emoji);

      // 1. Se for Lanterna E estiver Exposto E for Voto Ruim -> MOSTRA NOME PÚBLICO
      if (isTarget && lanternExposed && isNegative) {
        return `<div style="display:inline-block; text-align:center; margin:2px;">
                  <span>${d.emoji}</span><br>
                  <span style="font-size:0.6rem; color:#e53e3e; font-weight:bold;">${d.from}</span>
                </div>`;
      }
      
      // 2. Se for Lanterna (Privado) -> Pode clicar
      if (isTarget && currentUser === userData.name && isNegative && !lanternExposed) {
         return `<span class="reveal-enabled" onclick="alert('Quem mandou ${d.emoji}: ${d.from}')">${d.emoji}</span>`;
      }

      // 3. Normal
      return `<span>${d.emoji}</span>`;
    }).join("&nbsp;");

    const badge = isTarget ? `<span class="target-badge">💀 Lanterna</span>` : "";
    const trophy = (index === 0 && userData.score > 0) ? "👑" : ""; 

    div.innerHTML = `
      <div class="result-header">
        <strong style="font-size:1.1rem">${trophy} ${userData.name} ${badge}</strong>
        <span class="score-badge ${scoreClass}">${scoreSign}${userData.score}</span>
      </div>
      <div style="font-size: 1.1rem; line-height:1.5; margin-top:5px; flex-wrap: wrap; display:flex;">
        ${displayHTML || "<small style='color:#999'>...</small>"}
      </div>
    `;

    // Botão de Vingança do Lanterna
    if (currentUser === userData.name && isTarget && !lanternExposed) {
      const btn = document.createElement("button");
      btn.innerHTML = "🧨 DEDURAR: EXPOR NOMES";
      btn.className = "danger-btn";
      btn.style.width = "100%"; btn.style.marginTop = "10px"; btn.style.border = "2px dashed red";
      btn.onclick = async () => {
        if(confirm("Tem certeza? Todos verão quem te criticou.")) {
          await set(ref(database, `votes/${TODAY}/lanternExposed`), true);
        }
      };
      div.appendChild(btn);
    }
    
    el.results.list.appendChild(div);
  });
}

// ADMIN
el.header.btn.onclick = () => {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (currentUser === ADMIN_USER) {
    el.settings.title.textContent = "Admin";
    el.settings.normalArea.classList.add("hidden");
    el.settings.adminArea.classList.remove("hidden");
    renderAdminUserList();
  } else {
    el.settings.title.textContent = "Perfil";
    el.settings.normalArea.classList.remove("hidden");
    el.settings.adminArea.classList.add("hidden");
  }
  el.settings.overlay.classList.remove("hidden");
};
el.settings.closeBtn.onclick = () => el.settings.overlay.classList.add("hidden");

el.settings.saveBtn.onclick = async () => {
  const currentUser = sessionStorage.getItem("qm_logged");
  const newPass = el.settings.newPass.value.trim();
  if (newPass.length === 1) await set(ref(database, 'users/' + currentUser), newPass);
  el.settings.overlay.classList.add("hidden");
};

el.settings.deleteBtn.onclick = async () => {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (confirm(`Excluir?`)) {
    await remove(ref(database, 'users/' + currentUser));
    sessionStorage.removeItem("qm_logged"); location.reload();
  }
};

function renderAdminUserList() {
  el.settings.adminArea.innerHTML = "";
  const resetBtn = document.createElement("button");
  resetBtn.className = "danger-btn";
  resetBtn.style.marginBottom = "20px";
  resetBtn.innerHTML = "ZERAR DIA (INTRIGA E VOTOS)";
  resetBtn.onclick = async () => {
    if (prompt("Digite 'ZERAR'") === "ZERAR") {
      await remove(ref(database, `votes/${TODAY}`));
      await remove(ref(database, `intrigue/${TODAY}`));
      location.reload();
    }
  };
  el.settings.adminArea.appendChild(resetBtn);

  Object.keys(globalUsers).forEach(user => {
    if(user === ADMIN_USER) return; 
    const div = document.createElement("div"); div.className = "admin-user-item";
    div.innerHTML = `<span>${user}</span> <button class="danger-btn admin-delete-btn">X</button>`;
    div.querySelector("button").onclick = async () => { if(confirm(`Banir ${user}?`)) await remove(ref(database, 'users/' + user)); };
    el.settings.adminArea.appendChild(div);
  });
}

el.results.refreshBtn.onclick = () => location.reload();
el.results.logoutBtn.onclick = () => { sessionStorage.removeItem("qm_logged"); location.reload(); };

if (sessionStorage.getItem("qm_logged")) initApp();
