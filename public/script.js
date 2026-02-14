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
const ADMIN_PASS = "#"; 

// --- LISTAS DE EMOJIS PARA PONTUAÇÃO ---
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

// Lista unificada para o Modal
const EMOJIS = [...POSITIVE_EMOJIS, ...NEGATIVE_EMOJIS, ...NEUTRAL_EMOJIS];

// --- CONFIGURAÇÕES DA INTRIGA ---
const INTRIGA_OPCOES = {
  pergunta: "Quem você acha mais legal?",
  emojiA: "😊",
  emojiB: "😠"
};
// Poderia ser um array de perguntas para sortear, mas manteremos fixa por simplicidade.

// Variáveis Globais
let globalUsers = {};
let globalVotes = {};
let globalIntriga = {};      // { data, sorteado, respostas: { alvo: emoji } }
let currentTargetUser = null;
let currentIntrigaTarget = null; // para responder intriga

// Elementos DOM
const el = {
  header: { bar: document.getElementById("app-header"), msg: document.getElementById("welcome-msg"), btn: document.getElementById("settings-btn") },
  login: { card: document.getElementById("login"), btn: document.getElementById("loginBtn"), user: document.getElementById("username"), pass: document.getElementById("password"), error: document.getElementById("loginError") },
  vote: { card: document.getElementById("voting-area"), list: document.getElementById("users-to-vote"), count: document.getElementById("pending-count") },
  results: { card: document.getElementById("results-area"), list: document.getElementById("results-list"), refreshBtn: document.getElementById("refresh-btn"), logoutBtn: document.getElementById("logout-btn") },
  modal: { overlay: document.getElementById("emoji-modal"), title: document.getElementById("modal-title"), grid: document.getElementById("emoji-grid"), close: document.getElementById("close-modal") },
  settings: { overlay: document.getElementById("settings-modal"), title: document.getElementById("settings-title"), normalArea: document.getElementById("normal-user-settings"), adminArea: document.getElementById("admin-user-list"), newPass: document.getElementById("new-password"), saveBtn: document.getElementById("save-pass-btn"), deleteBtn: document.getElementById("delete-account-btn"), closeBtn: document.getElementById("close-settings") },
  intriga: { container: document.getElementById("intriga-container"), content: document.getElementById("intriga-content") },
  intrigaModal: { overlay: document.getElementById("intriga-modal"), title: document.getElementById("intriga-modal-title"), question: document.getElementById("intriga-question"), list: document.getElementById("intriga-users-list"), close: document.getElementById("close-intriga-modal") }
};

// ============================================================
// REALTIME LISTENERS
// ============================================================
onValue(ref(database, 'users'), (snapshot) => {
  globalUsers = snapshot.val() || {};
  refreshInterface();
});

onValue(ref(database, 'votes'), (snapshot) => {
  globalVotes = snapshot.val() || {};
  refreshInterface();
});

// Listener para intriga
onValue(ref(database, 'intriga'), (snapshot) => {
  globalIntriga = snapshot.val() || {};
  // Mantém apenas a intriga de hoje
  if (globalIntriga[TODAY]) {
    globalIntriga = globalIntriga[TODAY];
  } else {
    globalIntriga = null;
  }
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
    renderIntriga(); // Exibe ou esconde o card de intriga
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

  // ADMIN
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem("qm_logged", ADMIN_USER);
    initApp();
    return;
  }

  // USUÁRIO COMUM
  if (globalUsers[user]) {
    if (globalUsers[user] !== pass) { el.login.error.textContent = "Senha incorreta."; return; }
  } else {
    if (user.toUpperCase() === ADMIN_USER) { el.login.error.textContent = "Reservado."; return; }
    if (Object.values(globalUsers).includes(pass)) { el.login.error.textContent = "Caractere indisponível."; return; }
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
  await set(ref(database, `votes/${TODAY}/${currentUser}/${currentTargetUser}`), emoji);
  el.modal.overlay.classList.add("hidden");
  currentTargetUser = null;
}

// ============================================================
// RESULTADOS (COM PÍLULAS DE PONTUAÇÃO E DETALHES DO LANTERNA)
// ============================================================
function showResults() {
  el.vote.card.classList.add("hidden");
  el.results.card.classList.remove("hidden");
  
  const votesToday = globalVotes[TODAY] || {};
  
  let ranking = [];
  const allUsers = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);

  if (allUsers.length === 0) { el.results.list.innerHTML = "<p>Nenhum participante.</p>"; return; }

  // 1. Calcula Pontuação
  allUsers.forEach(user => {
    let score = 0;
    let receivedEmojis = [];

    Object.entries(votesToday).forEach(([voterKey, userVotes]) => {
      if (!globalUsers[voterKey] && voterKey !== ADMIN_USER) return;
      
      const emoji = userVotes[user];
      if (emoji) {
        receivedEmojis.push(emoji);
        if (POSITIVE_EMOJIS.includes(emoji)) score++;
        else if (NEGATIVE_EMOJIS.includes(emoji)) score--;
      }
    });

    ranking.push({
      name: user,
      score: score,
      emojis: receivedEmojis
    });
  });

  // 2. Ordena (Maior Score primeiro)
  ranking.sort((a, b) => b.score - a.score);

  // 3. Define Lanterna (último lugar)
  let lanterna = null;
  if (ranking.length > 0) {
    lanterna = ranking[ranking.length - 1];
  }

  // 4. Renderiza
  el.results.list.innerHTML = "";
  const currentUser = sessionStorage.getItem("qm_logged");

  ranking.forEach((userData, index) => {
    const div = document.createElement("div"); 
    div.className = "result-item"; 
    
    // Define a classe CSS da Badge
    let scoreClass = "score-neu";
    let scoreSign = "";
    if (userData.score > 0) {
        scoreClass = "score-pos";
        scoreSign = "+";
    } else if (userData.score < 0) {
        scoreClass = "score-neg";
    }

    const isLanterna = (userData.name === lanterna?.name);
    if (isLanterna) div.classList.add("target-of-the-day");

    // Contagem de emojis
    const counts = {}; 
    userData.emojis.forEach(e => counts[e] = (counts[e] || 0) + 1);
    
    const displayEmojis = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) 
      .map(([emoji, qtd]) => {
        return `<span>${emoji} <small>x${qtd}</small></span>`;
      }).join("&nbsp;&nbsp;");

    const badge = isLanterna ? `<span class="target-badge">💀 LANTERNA</span>` : "";
    const trophy = (index === 0 && userData.score > 0) ? "👑" : ""; 

    div.innerHTML = `
      <div class="result-header">
        <strong style="font-size:1.1rem">${trophy} ${userData.name} ${badge}</strong>
        <span class="score-badge ${scoreClass}">${scoreSign}${userData.score}</span>
      </div>
      <div style="font-size: 1.1rem; line-height:1.5; margin-top:5px;">
        ${displayEmojis || "<small style='color:#999'>Aguardando votos...</small>"}
      </div>
    `;
    
    // Se for o lanterna, adiciona detalhamento dos votos (visível para todos)
    if (isLanterna) {
      const detalhesDiv = document.createElement("div");
      detalhesDiv.className = "lanterna-votos-detalhe";
      
      // Mapeia votos recebidos pelo lanterna: para cada emoji, lista de votantes
      const votosDetalhados = {};
      Object.entries(votesToday).forEach(([voter, votes]) => {
        if (!globalUsers[voter] && voter !== ADMIN_USER) return;
        const emoji = votes[lanterna.name];
        if (emoji) {
          if (!votosDetalhados[emoji]) votosDetalhados[emoji] = [];
          votosDetalhados[emoji].push(voter);
        }
      });

      let detalhesHtml = '<p><strong>🔍 Votos recebidos:</strong></p><ul>';
      for (const [emoji, voters] of Object.entries(votosDetalhados)) {
        detalhesHtml += `<li>${emoji}: ${voters.join(', ')}</li>`;
      }
      detalhesHtml += '</ul>';
      detalhesDiv.innerHTML = detalhesHtml;
      div.appendChild(detalhesDiv);
    }
    
    el.results.list.appendChild(div);
  });
}

// ============================================================
// INTRIGA DO DIA
// ============================================================
async function renderIntriga() {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (!currentUser || currentUser === ADMIN_USER) {
    el.intriga.container.classList.add("hidden");
    return;
  }

  // Se não há intriga hoje, esconde
  if (!globalIntriga) {
    el.intriga.container.classList.add("hidden");
    return;
  }

  el.intriga.container.classList.remove("hidden");
  const intriga = globalIntriga;
  const isSorteado = (intriga.sorteado === currentUser);
  const respostas = intriga.respostas || {};

  let html = `<p><strong>${intriga.pergunta || INTRIGA_OPCOES.pergunta}</strong></p>`;

  if (isSorteado && Object.keys(respostas).length === 0) {
    // Sorteado ainda não respondeu
    html += `<button id="responder-intriga-btn" class="primary-btn">Responder</button>`;
  } else if (Object.keys(respostas).length > 0) {
    // Já respondido: mostra resultados
    html += '<div class="intriga-content">';
    for (const [alvo, emoji] of Object.entries(respostas)) {
      html += `
        <div class="intriga-item">
          <span class="emoji">${emoji}</span>
          <span class="nome">${alvo}</span>
        </div>
      `;
    }
    html += '</div>';
  } else {
    // Sorteado ainda não respondeu, mas não é ele (ou não há resposta) - mensagem padrão
    html += `<p><em>Aguardando resposta do sorteado...</em></p>`;
  }

  el.intriga.content.innerHTML = html;

  // Adiciona evento se botão aparecer
  const btnResponder = document.getElementById("responder-intriga-btn");
  if (btnResponder) {
    btnResponder.addEventListener("click", abrirModalIntriga);
  }
}

function abrirModalIntriga() {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (!globalIntriga || globalIntriga.sorteado !== currentUser) return;

  el.intrigaModal.title.textContent = "Responda a Intriga";
  el.intrigaModal.question.textContent = globalIntriga.pergunta || INTRIGA_OPCOES.pergunta;
  
  const lista = el.intrigaModal.list;
  lista.innerHTML = "";

  const allUsers = Object.keys(globalUsers).filter(u => u !== ADMIN_USER && u !== currentUser);
  const respostasAtuais = globalIntriga.respostas || {};

  allUsers.forEach(alvo => {
    const row = document.createElement("div");
    row.className = "intriga-user-row";
    row.innerHTML = `
      <span class="nome">${alvo}</span>
      <div class="opcoes">
        <button class="emoji-opcao" data-emoji="${INTRIGA_OPCOES.emojiA}">${INTRIGA_OPCOES.emojiA}</button>
        <button class="emoji-opcao" data-emoji="${INTRIGA_OPCOES.emojiB}">${INTRIGA_OPCOES.emojiB}</button>
      </div>
    `;
    const opcaoA = row.querySelector(`.emoji-opcao[data-emoji="${INTRIGA_OPCOES.emojiA}"]`);
    const opcaoB = row.querySelector(`.emoji-opcao[data-emoji="${INTRIGA_OPCOES.emojiB}"]`);
    
    // Marca se já tiver resposta
    if (respostasAtuais[alvo] === INTRIGA_OPCOES.emojiA) {
      opcaoA.classList.add("selecionado");
    } else if (respostasAtuais[alvo] === INTRIGA_OPCOES.emojiB) {
      opcaoB.classList.add("selecionado");
    }

    opcaoA.addEventListener("click", () => selecionarRespostaIntriga(alvo, INTRIGA_OPCOES.emojiA));
    opcaoB.addEventListener("click", () => selecionarRespostaIntriga(alvo, INTRIGA_OPCOES.emojiB));

    lista.appendChild(row);
  });

  el.intrigaModal.overlay.classList.remove("hidden");
}

async function selecionarRespostaIntriga(alvo, emoji) {
  const currentUser = sessionStorage.getItem("qm_logged");
  if (!globalIntriga || globalIntriga.sorteado !== currentUser) return;

  // Atualiza no banco
  const respostas = globalIntriga.respostas || {};
  respostas[alvo] = emoji;
  await set(ref(database, `intriga/${TODAY}/respostas`), respostas);

  // Atualiza UI do modal
  const botoes = document.querySelectorAll(`.intriga-user-row .opcoes button`);
  botoes.forEach(btn => btn.classList.remove("selecionado"));
  const botaoClicado = event.target;
  botaoClicado.classList.add("selecionado");
}

el.intrigaModal.close.addEventListener("click", () => {
  el.intrigaModal.overlay.classList.add("hidden");
});

// ============================================================
// ADMIN & SETTINGS (com botão para sortear intriga)
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
  el.settings.adminArea.innerHTML = "";

  // --- BOTÃO DE ZERAR VOTAÇÃO ---
  const resetBtn = document.createElement("button");
  resetBtn.className = "danger-btn";
  resetBtn.style.marginBottom = "20px";
  resetBtn.style.border = "2px dashed white";
  resetBtn.innerHTML = "REINICIAR VOTAÇÃO";
  
  resetBtn.onclick = async () => {
    const confirmation = prompt("Digite 'ZERAR' para apagar os votos de hoje:");
    if (confirmation === "ZERAR") {
      await remove(ref(database, `votes/${TODAY}`));
      alert("Votação reiniciada!");
      location.reload();
    } else {
      alert("Ação cancelada.");
    }
  };
  el.settings.adminArea.appendChild(resetBtn);

  // --- BOTÃO SORTEAR INTRIGA ---
  const sortearIntrigaBtn = document.createElement("button");
  sortearIntrigaBtn.className = "primary-btn";
  sortearIntrigaBtn.style.marginBottom = "20px";
  sortearIntrigaBtn.style.border = "2px dashed #48bb78";
  sortearIntrigaBtn.innerHTML = "🎲 SORTEAR INTRIGA";
  
  sortearIntrigaBtn.onclick = async () => {
    const usuariosComuns = Object.keys(globalUsers).filter(u => u !== ADMIN_USER);
    if (usuariosComuns.length === 0) {
      alert("Nenhum usuário comum cadastrado.");
      return;
    }
    const sorteado = usuariosComuns[Math.floor(Math.random() * usuariosComuns.length)];
    const novaIntriga = {
      pergunta: INTRIGA_OPCOES.pergunta,
      sorteado: sorteado,
      respostas: {}  // vazio
    };
    await set(ref(database, `intriga/${TODAY}`), novaIntriga);
    alert(`Intriga sorteada! ${sorteado} foi escolhido.`);
    location.reload();
  };
  el.settings.adminArea.appendChild(sortearIntrigaBtn);

  // Lista de usuários
  const userNames = Object.keys(globalUsers);
  if (userNames.length === 0) { 
    const p = document.createElement("p");
    p.innerText = "Nenhum usuário comum cadastrado.";
    el.settings.adminArea.appendChild(p);
    return; 
  }

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
