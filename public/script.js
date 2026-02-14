import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = { /* MANTÉM O SEU */ };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const TODAY = new Date().toISOString().split("T")[0];
const ADMIN_USER = "ADMIN";
const ADMIN_PASS = "#";

let globalUsers = {};
let globalVotes = {};
let currentTargetUser = null;

const el = {
  loginBtn: document.getElementById("loginBtn"),
  username: document.getElementById("username"),
  password: document.getElementById("password"),
  loginError: document.getElementById("loginError"),

  votingArea: document.getElementById("voting-area"),
  usersToVote: document.getElementById("users-to-vote"),
  pending: document.getElementById("pending-count"),

  resultsArea: document.getElementById("results-area"),
  resultsList: document.getElementById("results-list"),

  tabRanking: document.getElementById("tab-ranking"),
  tabReveal: document.getElementById("tab-reveal"),
  rankingView: document.getElementById("ranking-view"),
  revealView: document.getElementById("reveal-view"),
  revealChoices: document.getElementById("reveal-choices"),
  revealResult: document.getElementById("reveal-result"),

  modal: document.getElementById("emoji-modal"),
  modalTitle: document.getElementById("modal-title"),
  modalGrid: document.getElementById("emoji-grid"),
  closeModal: document.getElementById("close-modal"),

  refresh: document.getElementById("refresh-btn"),
  logout: document.getElementById("logout-btn"),
};

onValue(ref(database, "users"), s => { globalUsers = s.val() || {}; refresh(); });
onValue(ref(database, "votes"), s => { globalVotes = s.val() || {}; refresh(); });

function refresh() {
  const u = sessionStorage.getItem("qm_logged");
  if (!u) return;

  if (u === ADMIN_USER) showResults();
  else checkVoting();
}

/* LOGIN */
el.loginBtn.onclick = async () => {
  const u = el.username.value.trim();
  const p = el.password.value.trim();

  if (!u || p.length !== 1) return;

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    sessionStorage.setItem("qm_logged", u);
    location.reload();
    return;
  }

  if (!globalUsers[u]) await set(ref(database, "users/" + u), p);
  else if (globalUsers[u] !== p) return;

  sessionStorage.setItem("qm_logged", u);
  location.reload();
};

/* VOTAÇÃO */
function checkVoting() {
  const me = sessionStorage.getItem("qm_logged");
  const votesToday = globalVotes[TODAY] || {};
  const myVotes = votesToday[me] || {};

  const toVote = Object.keys(globalUsers).filter(u => u !== me && !myVotes[u]);

  if (toVote.length === 0) showResults();
  else {
    el.votingArea.classList.remove("hidden");
    el.resultsArea.classList.add("hidden");

    el.usersToVote.innerHTML = "";
    el.pending.textContent = `Faltam ${toVote.length} votos`;

    toVote.forEach(name => {
      const b = document.createElement("button");
      b.className = "user-to-vote-btn";
      b.textContent = "Votar em " + name;
      b.onclick = () => openModal(name);
      el.usersToVote.appendChild(b);
    });
  }
}

function openModal(name) {
  currentTargetUser = name;
  el.modalTitle.textContent = "Emoji para " + name;
  el.modalGrid.innerHTML = "😀 😡 ❤️ 💀 👍 👎".split(" ").map(e =>
    `<button class="emoji-option" onclick="window.vote('${e}')">${e}</button>`
  ).join("");
  el.modal.classList.remove("hidden");
}

window.vote = async (emoji) => {
  const me = sessionStorage.getItem("qm_logged");
  await set(ref(database, `votes/${TODAY}/${me}/${currentTargetUser}`), emoji);
  el.modal.classList.add("hidden");
};

el.closeModal.onclick = () => el.modal.classList.add("hidden");

/* RESULTADOS + ABAS */
function showResults() {
  el.votingArea.classList.add("hidden");
  el.resultsArea.classList.remove("hidden");

  renderRanking();
}

/* RANKING */
function renderRanking() {
  const votesToday = globalVotes[TODAY] || {};
  const users = Object.keys(globalUsers);

  el.resultsList.innerHTML = "";

  users.forEach(u => {
    let score = 0;
    Object.values(votesToday).forEach(v => {
      if (v?.[u] === "😀" || v?.[u] === "❤️" || v?.[u] === "👍") score++;
      if (v?.[u] === "😡" || v?.[u] === "💀" || v?.[u] === "👎") score--;
    });

    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <div class="result-header">
        <strong>${u}</strong>
        <span class="score-badge ${score>0?"score-pos":score<0?"score-neg":"score-neu"}">${score}</span>
      </div>
    `;
    el.resultsList.appendChild(div);
  });
}

/* TABS */
el.tabRanking.onclick = () => {
  el.tabRanking.classList.add("active");
  el.tabReveal.classList.remove("active");
  el.rankingView.classList.remove("hidden");
  el.revealView.classList.add("hidden");
};

el.tabReveal.onclick = () => {
  el.tabReveal.classList.add("active");
  el.tabRanking.classList.remove("active");
  el.revealView.classList.remove("hidden");
  el.rankingView.classList.add("hidden");
  renderReveal();
};

/* REVELAR 1 VOTO */
function renderReveal() {
  const me = sessionStorage.getItem("qm_logged");
  const votesToday = globalVotes[TODAY] || {};

  el.revealChoices.innerHTML = "";

  const counts = {};
  Object.values(votesToday).forEach(v => {
    const e = v?.[me];
    if (e) counts[e] = (counts[e]||0)+1;
  });

  Object.entries(counts).forEach(([emoji,q])=>{
    const b=document.createElement("button");
    b.className="reveal-btn";
    b.textContent=`${emoji} x${q}`;
    b.onclick=()=>revealOne(me,emoji);
    el.revealChoices.appendChild(b);
  });
}

async function revealOne(me,emoji){
  const votesToday = globalVotes[TODAY] || {};
  const names=[];

  Object.entries(votesToday).forEach(([voter,v])=>{
    if(v?.[me]===emoji) names.push(voter);
  });

  el.revealResult.classList.remove("hidden");
  el.revealResult.textContent = names.length
    ? `Quem enviou ${emoji}: ${names.join(", ")}`
    : "Ninguém encontrado.";

  await set(ref(database, `votes/${TODAY}/__revealed/${me}`), true);
}

/* BOTÕES */
el.refresh.onclick = ()=>location.reload();
el.logout.onclick = ()=>{sessionStorage.clear();location.reload();}
