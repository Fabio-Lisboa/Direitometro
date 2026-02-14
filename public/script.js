// --- IMPORTAÇÕES ---
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

const TODAY = new Date().toISOString().split('T')[0];
const ADMIN_USER = "ADMIN";
const ADMIN_PASS = "#"; 

// --- EMOJIS ---
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

const INTRIGUE_QUESTIONS = [
  { q: "Em um apocalipse zumbi:", a: "Sobrevive", b: "Morre Primeiro" },
  { q: "Quem tem mais chance de ser preso?", a: "Inocente", b: "Culpado" },
  { q: "Quem seria cancelado na internet?", a: "Cancelado", b: "Amado" },
  { q: "Num filme de terror:", a: "O Assassino", b: "A Vítima" },
  { q: "Quem gasta todo o dinheiro da Mega Sena?", a: "Investe", b: "Gasta tudo" },
  { q: "Quem chora no banho?", a: "Chora", b: "Nem liga" },
  { q: "Quem é mais provável de virar político?", a: "Político", b: "Eleitor" },
  { q: "Quem some no rolê?", a: "Mago dos sumiços", b: "Inimigo do fim" }
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
  
  // Cards Principais
  intrigue: { card: document.getElementById("intrigue-area"), waiting: document.getElementById("intrigue-waiting"), play: document.getElementById("intrigue-play"), result: document.getElementById("intrigue-result"), qText: document.getElementById("intrigue-q-text"), inputs: document.getElementById("intrigue-inputs"), submit: document.getElementById("submit-intrigue-btn") },
  vote: { card: document.getElementById("voting-area"), list: document.getElementById("users-to-vote"), count: document.getElementById("pending-count") },
  results: { card: document.getElementById("results-area"), list: document.getElementById("results-list"), refreshBtn: document.getElementById("refresh-btn") },
  
  modal: { overlay: document.getElementById("emoji-modal"), grid: document.getElementById("emoji-grid"), close: document.getElementById("close-modal") },
  settings: { overlay: document.getElementById("settings-modal"), normalArea: document.getElementById("normal-settings"), adminArea: document.getElementById("admin-area"), newPass: document.getElementById("new-password"), saveBtn: document.getElementById("save-pass-btn"), logoutBtn: document.getElementById("logout-btn"), deleteBtn: document.getElementById("delete-account-btn"), closeBtn: document.getElementById("close-settings") }
};

// LISTENERS
onValue(ref(database, 'users'), (s) => { globalUsers = s.val() || {}; refreshData(); });
onValue(ref(database, 'votes'), (s) => { globalVotes = s.val() || {}; refreshData(); });
onValue(ref(database, `intrigue/${TODAY}`), (s) => { globalIntrigue = s.val() || {}; refreshData(); });

function refreshData() {
  const user = sessionStorage.getItem("qm_logged");
  if (!user) return;
  if (user === ADMIN_USER) renderAdmin(); 
  else {
    renderIntrigue();
    renderVoting();
    renderRanking();
  }
}

// LOGIN
el.login.btn.addEventListener("click", async () => {
  const user = el.login.user.value.trim();
  const pass = el.login.pass.value.trim();
  el.login.error.textContent = "";

  if (!user || pass.length !== 1) { el.login.error.textContent = "Preencha tudo."; return; }

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem("qm_logged", ADMIN_USER);
    showApp(); return;
  }

  if (globalUsers[user]) {
    if (globalUsers[user] !== pass) { el.login.error.textContent = "Senha errada."; return; }
  } else {
    if (user.toUpperCase() === ADMIN_USER) return;
    if (Object.values(globalUsers).includes(pass)) { el.login.error.textContent = "Senha em uso."; return; }
    await set(ref(database, 'users/'+user), pass);
  }
  sessionStorage.setItem("qm_logged", user);
  showApp();
});

function showApp() {
  const user = sessionStorage.getItem("qm_logged");
  if (!user) return;
  el.screens.login.classList.add("hidden");
  el.screens.app.classList.remove("hidden");
  el.header.msg.textContent = user;
  el.header.avatar.textContent = user.charAt(0).toUpperCase();
  refreshData();
  if(user === ADMIN_USER) {
    el.settings.overlay.classList.remove("hidden");
    renderAdmin();
  }
}

// 1. INTRIGA
function renderIntrigue() {
  const user = sessionStorage.getItem("qm_logged");
  const users = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);
  
  if (users.length < 2) { el.intrigue.card.classList.add("hidden"); return; }
  el.intrigue.card.classList.remove("hidden");

  const dayHash = TODAY.split('-').reduce((a,b)=>parseInt(a)+parseInt(b),0);
  const judge = users[dayHash % users.length];

  el.intrigue.waiting.classList.add("hidden");
  el.intrigue.play.classList.add("hidden");
  el.intrigue.result.classList.add("hidden");

  if (globalIntrigue.verdict) {
    el.intrigue.result.classList.remove("hidden");
    const q = globalIntrigue.qData;
    document.getElementById("res-q-text").innerText = q.q;
    document.getElementById("res-judge").innerText = judge;
    document.getElementById("label-a").innerText = q.a;
    document.getElementById("label-b").innerText = q.b;
    
    const listA = document.getElementById("list-a");
    const listB = document.getElementById("list-b");
    listA.innerHTML = ""; listB.innerHTML = "";
    Object.entries(globalIntrigue.verdict).forEach(([u, val]) => {
      const sp = document.createElement("div"); 
      sp.className="intrigue-item"; sp.innerText = u;
      if(val==="A") listA.appendChild(sp); else listB.appendChild(sp);
    });
    return;
  }

  if (user === judge) {
    el.intrigue.play.classList.remove("hidden");
    const q = INTRIGUE_QUESTIONS[dayHash % INTRIGUE_QUESTIONS.length];
    el.intrigue.qText.innerText = q.q;
    el.intrigue.inputs.innerHTML = "";
    users.forEach(u => {
      if(u===user) return;
      const row = document.createElement("div");
      row.className = "intrigue-row";
      row.innerHTML = `<span>${u}</span><select id="sel-${u}" class="select-box"><option value="A">${q.a}</option><option value="B">${q.b}</option></select>`;
      el.intrigue.inputs.appendChild(row);
    });
    el.intrigue.submit.onclick = async () => {
      const verdict = {};
      users.forEach(u => {
        if(u!==user) verdict[u] = document.getElementById(`sel-${u}`).value;
      });
      await set(ref(database, `intrigue/${TODAY}`), { verdict, qData: q });
    };
  } else {
    el.intrigue.waiting.classList.remove("hidden");
    document.getElementById("judge-name").innerText = judge;
  }
}

// 2. VOTAÇÃO
function renderVoting() {
  const user = sessionStorage.getItem("qm_logged");
  const all = Object.keys(globalUsers);
  const votes = globalVotes[TODAY] || {};
  const myVotes = votes[user] || {};
  const toVote = all.filter(u => u !== user && u !== ADMIN_USER && !myVotes[u]);

  el.vote.count.innerText = toVote.length;
  el.vote.list.innerHTML = "";

  if(toVote.length === 0) {
    el.vote.list.innerHTML = "<div style='text-align:center; padding:15px; color:#aaa'>✅ Tudo em dia!</div>";
    return;
  }

  toVote.forEach(target => {
    const item = document.createElement("div");
    item.className = "vote-item";
    item.innerHTML = `<strong>${target}</strong><span>👉 Julgar</span>`;
    item.onclick = () => {
      currentTargetUser = target;
      el.modal.grid.innerHTML = "";
      EMOJIS.forEach(e => {
        const b = document.createElement("button");
        b.className = "emoji-btn"; b.innerText = e;
        b.onclick = async () => {
          await set(ref(database, `votes/${TODAY}/${user}/${target}`), e);
          el.modal.overlay.classList.add("hidden");
        };
        el.modal.grid.appendChild(b);
      });
      el.modal.overlay.classList.remove("hidden");
    };
    el.vote.list.appendChild(item);
  });
}

// 3. RANKING
function renderRanking() {
  const user = sessionStorage.getItem("qm_logged");
  const votes = globalVotes[TODAY] || {};
  const lanternExposed = votes.lanternExposed || false;
  
  let list = [];
  const allUsers = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);

  if (allUsers.length === 0) { el.results.list.innerHTML = "<p>Sem dados.</p>"; return; }

  allUsers.forEach(u => {
    let score = 0; let details = [];
    Object.entries(votes).forEach(([voter, uvotes]) => {
      if(!globalUsers[voter] && voter !== ADMIN_USER) return;
      if(voter === "lanternExposed") return;
      const emoji = uvotes[u];
      if(emoji) {
        details.push({ emoji, from: voter });
        if(POSITIVE_EMOJIS.includes(emoji)) score++;
        else if(NEGATIVE_EMOJIS.includes(emoji)) score--;
      }
    });
    list.push({ name: u, score, details });
  });

  list.sort((a,b) => b.score - a.score);
  const lanternName = list.length > 0 ? list[list.length-1].name : null;

  el.results.list.innerHTML = "";
  list.forEach((data, idx) => {
    const div = document.createElement("div");
    div.className = "rank-item";
    const isTarget = data.name === lanternName;
    const trophy = (idx === 0 && data.score > 0) ? "👑" : "";
    const lanternBadge = isTarget ? `<span class="lanterna-tag">💀 LANTERNA</span>` : "";
    
    let pillClass = "sc-neu";
    if(data.score > 0) pillClass = "sc-pos";
    else if(data.score < 0) pillClass = "sc-neg";

    // EMOJIS
    const emojisHtml = data.details.map(d => {
      const isNeg = NEGATIVE_EMOJIS.includes(d.emoji);
      // Se for lanterna, estiver exposto E for negativo -> Mostra nome
      if (isTarget && lanternExposed && isNeg) {
        return `<div class="exposed-pill"><span>${d.emoji}</span><span class="exposed-name">${d.from}</span></div>`;
      }
      // Se sou eu (lanterna) vendo meus negativos -> clicável
      if (isTarget && user === data.name && isNeg && !lanternExposed) {
        return `<span class="e-pill reveal-cursor" onclick="alert('${d.from}')">${d.emoji}</span>`;
      }
      return `<span class="e-pill">${d.emoji}</span>`;
    }).join("");

    div.innerHTML = `
      <div class="rank-top">
        <div class="rank-name">${trophy} ${data.name} ${lanternBadge}</div>
        <div class="score-pill ${pillClass}">${data.score>0?'+':''}${data.score}</div>
      </div>
      <div class="emojis-container">${emojisHtml}</div>
    `;

    // Botão Expor
    if (user === data.name && isTarget && !lanternExposed) {
      const btn = document.createElement("button");
      btn.className = "btn-expose";
      btn.innerHTML = "🧨 VINGANÇA: EXPOR TUDO";
      btn.onclick = () => {
        if(confirm("Expor os nomes para TODO MUNDO ver?")) {
           set(ref(database, `votes/${TODAY}/lanternExposed`), true);
        }
      };
      div.appendChild(btn);
    }

    el.results.list.appendChild(div);
  });
}

// UI HELPERS
el.modal.close.onclick = () => el.modal.overlay.classList.add("hidden");
el.header.settingsBtn.onclick = () => {
  const u = sessionStorage.getItem("qm_logged");
  if(u===ADMIN_USER) renderAdmin();
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
  const p = el.settings.newPass.value;
  if(p.length===1) { await set(ref(database,'users/'+u), p); alert("Salvo"); }
};
el.settings.deleteBtn.onclick = async () => {
  if(confirm("Excluir?")) {
    await remove(ref(database,'users/'+sessionStorage.getItem("qm_logged")));
    sessionStorage.removeItem("qm_logged"); location.reload();
  }
};
el.results.refreshBtn.onclick = () => location.reload();

function renderAdmin() {
  el.settings.adminArea.innerHTML = "";
  el.settings.adminArea.classList.remove("hidden");
  el.settings.normalArea.classList.add("hidden");
  
  const reset = document.createElement("button");
  reset.className = "btn-danger full"; reset.innerText = "ZERAR DIA";
  reset.onclick = async () => { if(prompt("ZERAR?")==="ZERAR"){ await remove(ref(database,`votes/${TODAY}`)); await remove(ref(database,`intrigue/${TODAY}`)); location.reload(); }};
  el.settings.adminArea.appendChild(reset);
  
  Object.keys(globalUsers).forEach(u => {
    if(u===ADMIN_USER) return;
    const r = document.createElement("div");
    r.style.display="flex"; r.style.justifyContent="space-between"; r.style.margin="10px 0";
    r.innerHTML = `<span>${u}</span>`;
    const b = document.createElement("button"); b.innerText="X"; b.onclick=async()=>{if(confirm("Ban?")) await remove(ref(database,'users/'+u));};
    r.appendChild(b); el.settings.adminArea.appendChild(r);
  });
}

if(sessionStorage.getItem("qm_logged")) showApp();
