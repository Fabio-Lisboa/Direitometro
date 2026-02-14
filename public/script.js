// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, remove, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- CONFIGURAÇÃO ---
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

// --- CONSTANTES ---
const TODAY = new Date().toISOString().split('T')[0];
const ADMIN_USER = "ADMIN";
const ADMIN_PASS = "#"; 

// --- LISTAS DE EMOJIS (Plantas = Negativo) ---
const POSITIVE_EMOJIS = [
  "❤️","🔥","👍","🥰","😍","👏","🙏","💪","🎉","😁","💕","☺️","👑","🏆","🥇","💎",
  "💰","🚀","😎","✨","💖","💯","🫶","🤝","✌️","🤘","🤙","🛡️","😇","✅",
  "🫡","🧠","🌟","🥂","🐐","🎩","🔋","🔝","🪄","💍","🦅","🦁","🌞","💡",
  "🤩","🥳","😻","😽","💝","💗","💓","💞","💟","🎖️","🏅","🗿",
  "🥈","🥉","🎫","🎇","🎆","🆙","🆒","🆗","🛐","🧜‍♂️","🧞‍♂️","🦸","🧚","👼","👰",
  "🤱","🐚","🐾","🐱","🥺"
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
  { q: "Quem gastaria todo o dinheiro da Mega Sena?", a: "Investidor", b: "Falido em 1 mês" },
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
  screens: { login: document.getElementById("login-screen"), app: document.getElementById("app-screen") },
  header: { avatar: document.getElementById("user-avatar"), msg: document.getElementById("welcome-msg"), settingsBtn: document.getElementById("settings-btn") },
  login: { btn: document.getElementById("loginBtn"), user: document.getElementById("username"), pass: document.getElementById("password"), error: document.getElementById("loginError") },
  tabs: { vote: document.getElementById("tab-vote"), rank: document.getElementById("tab-rank"), intrigue: document.getElementById("tab-intrigue") },
  voteList: document.getElementById("users-to-vote"), pendingCount: document.getElementById("pending-count"),
  rankList: document.getElementById("results-list"), refreshBtn: document.getElementById("refresh-btn"),
  intrigue: {
    wait: document.getElementById("intrigue-waiting"),
    play: document.getElementById("intrigue-play"),
    result: document.getElementById("intrigue-result"),
    judgeName: document.getElementById("judge-name"),
    qText: document.getElementById("intrigue-q-text"),
    inputs: document.getElementById("intrigue-inputs"),
    submit: document.getElementById("submit-intrigue-btn")
  },
  modal: { overlay: document.getElementById("emoji-modal"), grid: document.getElementById("emoji-grid"), close: document.getElementById("close-modal") },
  settings: { overlay: document.getElementById("settings-modal"), normalArea: document.getElementById("normal-settings"), adminArea: document.getElementById("admin-area"), newPass: document.getElementById("new-password"), saveBtn: document.getElementById("save-pass-btn"), logoutBtn: document.getElementById("logout-btn"), deleteBtn: document.getElementById("delete-account-btn"), closeBtn: document.getElementById("close-settings") }
};

// ============================================================
// REALTIME LISTENERS
// ============================================================
onValue(ref(database, 'users'), (snap) => { globalUsers = snap.val() || {}; refreshData(); });
onValue(ref(database, 'votes'), (snap) => { globalVotes = snap.val() || {}; refreshData(); });
onValue(ref(database, `intrigue/${TODAY}`), (snap) => { globalIntrigue = snap.val() || {}; refreshData(); });

function refreshData() {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (currentUser) {
    if (currentUser === ADMIN_USER) renderAdmin(); 
    else {
      renderVoteTab();
      renderRankTab();
      renderIntrigueTab();
    }
  }
}

// ============================================================
// LOGIN E NAVEGAÇÃO
// ============================================================
el.login.btn.addEventListener("click", async () => {
  const user = el.login.user.value.trim();
  const pass = el.login.pass.value.trim();
  el.login.error.textContent = "";

  if (!user || pass.length !== 1) { el.login.error.textContent = "Preencha nome e senha."; return; }

  // ADMIN
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem("qm_logged", ADMIN_USER);
    showApp();
    return;
  }

  if (globalUsers[user]) {
    if (globalUsers[user] !== pass) { el.login.error.textContent = "Senha incorreta."; return; }
  } else {
    if (user.toUpperCase() === ADMIN_USER) { el.login.error.textContent = "Nome reservado."; return; }
    if (Object.values(globalUsers).includes(pass)) { el.login.error.textContent = "Senha em uso."; return; }
    await set(ref(database, 'users/' + user), pass);
  }

  sessionStorage.setItem("qm_logged", user);
  showApp();
});

function showApp() {
  const user = sessionStorage.getItem("qm_logged");
  if (!user) return;
  
  el.screens.login.classList.remove("active");
  el.screens.login.classList.add("hidden");
  
  el.screens.app.classList.remove("hidden");
  el.screens.app.classList.add("active");

  el.header.msg.textContent = user;
  el.header.avatar.textContent = user.charAt(0).toUpperCase();

  refreshData();
  
  // Se for admin, mostra configurações direto
  if (user === ADMIN_USER) {
    el.settings.overlay.classList.remove("hidden");
    renderAdmin();
  }
}

// ============================================================
// ABA 1: VOTAÇÃO
// ============================================================
function renderVoteTab() {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (!currentUser || currentUser === ADMIN_USER) return;

  const allUsers = Object.keys(globalUsers);
  const votesToday = globalVotes[TODAY] || {};
  const myVotes = votesToday[currentUser] || {};
  const toVote = allUsers.filter(u => u !== currentUser && u !== ADMIN_USER && !myVotes[u]);

  el.pendingCount.textContent = toVote.length === 0 ? "Tudo em dia!" : `Faltam ${toVote.length}`;
  el.voteList.innerHTML = "";

  if (toVote.length === 0) {
    el.voteList.innerHTML = `<div style="text-align:center; padding:30px; color:#a0aec0;">
      <div style="font-size:3rem; margin-bottom:10px;">✅</div>
      Você já julgou todos.
    </div>`;
  }

  toVote.forEach(target => {
    const card = document.createElement("div");
    card.className = "vote-card";
    card.innerHTML = `
      <div class="vote-info">
        <strong>${target}</strong>
        <span>Toque para julgar</span>
      </div>
      <div class="vote-action">⚖️</div>
    `;
    card.onclick = () => openEmojiModal(target);
    el.voteList.appendChild(card);
  });
}

function openEmojiModal(targetName) {
  currentTargetUser = targetName;
  el.modal.grid.innerHTML = "";
  EMOJIS.forEach(emoji => {
    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.className = "emoji-btn";
    btn.onclick = () => { confirmVote(emoji); };
    el.modal.grid.appendChild(btn);
  });
  el.modal.overlay.classList.remove("hidden");
}

el.modal.close.onclick = () => el.modal.overlay.classList.add("hidden");

async function confirmVote(emoji) {
  if (!currentTargetUser) return;
  const currentUser = sessionStorage.getItem("qm_logged");
  await set(ref(database, `votes/${TODAY}/${currentUser}/${currentTargetUser}`), emoji);
  el.modal.overlay.classList.add("hidden");
}

// ============================================================
// ABA 2: RANKING (COM LANTERNA EXPOSED)
// ============================================================
function renderRankTab() {
  const currentUser = sessionStorage.getItem("qm_logged");
  const votesToday = globalVotes[TODAY] || {};
  const lanternExposed = votesToday.lanternExposed || false;
  
  let ranking = [];
  const allUsers = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);

  if (allUsers.length === 0) { el.rankList.innerHTML = "<p style='text-align:center'>Sem dados.</p>"; return; }

  // Calcular
  allUsers.forEach(user => {
    let score = 0;
    let details = [];
    Object.entries(votesToday).forEach(([voter, userVotes]) => {
      if (!globalUsers[voter] && voter !== ADMIN_USER) return;
      if (voter === "lanternExposed") return;
      
      const emoji = userVotes[user];
      if (emoji) {
        details.push({ emoji, from: voter });
        if (POSITIVE_EMOJIS.includes(emoji)) score++;
        else if (NEGATIVE_EMOJIS.includes(emoji)) score--;
      }
    });
    ranking.push({ name: user, score, details });
  });

  ranking.sort((a, b) => b.score - a.score);
  let targetName = ranking.length > 0 ? ranking[ranking.length - 1].name : null;

  // Renderizar
  el.rankList.innerHTML = "";
  ranking.forEach((userData, index) => {
    const card = document.createElement("div");
    card.className = "rank-card";
    const isTarget = userData.name === targetName;
    if (isTarget) card.classList.add("target-of-the-day");

    let badgeClass = "bg-neu";
    if (userData.score > 0) badgeClass = "bg-pos";
    else if (userData.score < 0) badgeClass = "bg-neg";

    const trophy = index === 0 && userData.score > 0 ? "👑 " : "";
    const lanternBadge = isTarget ? `<span class="lantern-badge">LANTERNA</span>` : "";

    // Emojis HTML
    const emojisHTML = userData.details.map(d => {
      const isNegative = NEGATIVE_EMOJIS.includes(d.emoji);
      // Se for lanterna, estiver exposto E for emoji negativo, mostra o nome
      if (isTarget && lanternExposed && isNegative) {
        return `<div class="exposed-pill">
                  <span>${d.emoji}</span>
                  <span class="exposed-name">${d.from}</span>
                </div>`;
      }
      
      // Se sou eu (Lanterna) vendo meus votos negativos -> mostra clicável
      if (isTarget && currentUser === userData.name && isNegative && !lanternExposed) {
         return `<span class="emoji-pill reveal-cursor" onclick="revealOne('${d.emoji}', '${d.from}')">${d.emoji}</span>`;
      }

      return `<span class="emoji-pill">${d.emoji}</span>`;
    }).join("");

    card.innerHTML = `
      <div class="rank-header">
        <div class="rank-name">${trophy} ${userData.name} ${lanternBadge}</div>
        <div class="badge-score ${badgeClass}">${userData.score > 0 ? '+' : ''}${userData.score}</div>
      </div>
      <div class="emoji-row">${emojisHTML || "<small>...</small>"}</div>
    `;

    // Botão de Exposição Total (Apenas para o Lanterna)
    if (currentUser === userData.name && isTarget && !lanternExposed) {
      const btn = document.createElement("button");
      btn.className = "expose-btn";
      btn.innerHTML = "🧨 DEDURAR: EXPOR NOMES PUBLICAMENTE";
      btn.onclick = () => {
        if(confirm("Isso vai mostrar os nomes de quem te criticou NA TELA DE TODOS. Confirmar vingança?")) {
          set(ref(database, `votes/${TODAY}/lanternExposed`), true);
        }
      };
      card.appendChild(btn);
    }

    el.rankList.appendChild(card);
  });
}

// Função auxiliar para o Lanterna ver um por um (privado)
window.revealOne = function(emoji, from) {
  alert(`Quem mandou ${emoji}: ${from}`);
}

// ============================================================
// ABA 3: INTRIGA
// ============================================================
function renderIntrigueTab() {
  const currentUser = sessionStorage.getItem("qm_logged");
  const users = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);
  
  if (users.length < 2) {
    el.intrigue.wait.classList.remove("hidden");
    el.intrigue.wait.innerHTML = "<p>Precisa de mais gente para ter intriga.</p>";
    return; 
  }

  // Define Juiz
  const dayHash = TODAY.split('-').reduce((a,b) => parseInt(a)+parseInt(b), 0);
  const judgeIndex = dayHash % users.length;
  const judgeName = users[judgeIndex];

  // Esconde tudo primeiro
  el.intrigue.wait.classList.add("hidden");
  el.intrigue.play.classList.add("hidden");
  el.intrigue.result.classList.add("hidden");

  // CASO 1: Já tem resultado
  if (globalIntrigue.verdict) {
    el.intrigue.result.classList.remove("hidden");
    const q = globalIntrigue.qData;
    document.getElementById("res-q-text").innerText = q.q;
    document.getElementById("res-judge").innerText = judgeName;
    document.getElementById("label-a").innerText = q.a;
    document.getElementById("label-b").innerText = q.b;
    
    const listA = document.getElementById("list-a");
    const listB = document.getElementById("list-b");
    listA.innerHTML = ""; listB.innerHTML = "";
    
    Object.entries(globalIntrigue.verdict).forEach(([u, val]) => {
      const span = document.createElement("span");
      span.innerText = u;
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
    el.intrigue.qText.innerText = q.q;
    
    el.intrigue.inputs.innerHTML = "";
    users.forEach(u => {
      if (u === currentUser) return;
      const row = document.createElement("div");
      row.className = "input-row";
      row.innerHTML = `
        <span>${u}</span>
        <select id="sel-${u}" class="select-box">
          <option value="A">${q.a}</option>
          <option value="B">${q.b}</option>
        </select>
      `;
      el.intrigue.inputs.appendChild(row);
    });

    el.intrigue.submit.onclick = async () => {
      const verdict = {};
      users.forEach(u => {
        if (u === currentUser) return;
        verdict[u] = document.getElementById(`sel-${u}`).value;
      });
      await set(ref(database, `intrigue/${TODAY}`), { verdict, qData: q, judge: currentUser });
    };
    return;
  }

  // CASO 3: Esperando o Juiz
  el.intrigue.wait.classList.remove("hidden");
  el.intrigue.judgeName.innerText = judgeName;
}


// ============================================================
// ADMIN & SETTINGS
// ============================================================
el.header.settingsBtn.onclick = () => {
  const user = sessionStorage.getItem("qm_logged");
  if (user === ADMIN_USER) renderAdmin();
  else {
    el.settings.normalArea.classList.remove("hidden");
    el.settings.adminArea.classList.add("hidden");
  }
  el.settings.overlay.classList.remove("hidden");
};
el.settings.closeBtn.onclick = () => el.settings.overlay.classList.add("hidden");

el.settings.logoutBtn.onclick = () => { sessionStorage.removeItem("qm_logged"); location.reload(); };

el.settings.saveBtn.onclick = async () => {
  const u = sessionStorage.getItem("qm_logged");
  const p = el.settings.newPass.value.trim();
  if (p.length === 1) { await set(ref(database, 'users/'+u), p); alert("Salvo"); }
};

el.settings.deleteBtn.onclick = async () => {
  if(confirm("Excluir conta?")) {
    await remove(ref(database, 'users/'+sessionStorage.getItem("qm_logged")));
    sessionStorage.removeItem("qm_logged"); location.reload();
  }
};

function renderAdmin() {
  el.settings.adminArea.classList.remove("hidden");
  el.settings.normalArea.classList.add("hidden");
  el.settings.adminArea.innerHTML = "";

  const btnReset = document.createElement("button");
  btnReset.className = "btn-danger full-width";
  btnReset.innerText = "ZERAR TUDO (DIA)";
  btnReset.onclick = async () => {
    if(prompt("Digite ZERAR")==="ZERAR") {
      await remove(ref(database, `votes/${TODAY}`));
      await remove(ref(database, `intrigue/${TODAY}`));
      location.reload();
    }
  };
  el.settings.adminArea.appendChild(btnReset);

  // Lista de users para excluir
  const list = document.createElement("div");
  list.style.marginTop = "20px";
  Object.keys(globalUsers).forEach(u => {
    if(u===ADMIN_USER) return;
    const row = document.createElement("div");
    row.style.display = "flex"; row.style.justifyContent="space-between"; row.style.margin="10px 0";
    row.innerHTML = `<span>${u} (${globalUsers[u]})</span>`;
    const del = document.createElement("button");
    del.innerText = "X"; del.className = "btn-danger"; del.style.padding="5px 10px";
    del.onclick = async () => { if(confirm("Banir?")) await remove(ref(database, 'users/'+u)); };
    row.appendChild(del);
    list.appendChild(row);
  });
  el.settings.adminArea.appendChild(list);
}

el.rankList.parentNode.querySelector("#refresh-btn").onclick = () => window.location.reload();

// Auto-start
if (sessionStorage.getItem("qm_logged")) showApp();
