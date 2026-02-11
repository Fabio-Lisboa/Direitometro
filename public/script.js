document.addEventListener("DOMContentLoaded", () => {
  const TODAY = new Date().toISOString().split('T')[0];

  const EMOJIS = [
    "😂","❤️","🤣","👍","😭","🙏","😘","🥰","😍","😊",
    "🎉","😁","💕","🥺","😅","🔥","☺️","🤦","♥️","🤷",
    "🙄","😆","🤗","😉","🎂","🤔","👏","🙂","😳","🥳",
    "😎","👌","💜","😔","💪","✨","💖","👀","😋","😏",
    "😢","👉","💗","😩","💯","🌹","💞","🎈","💙","😃"
  ];

  // Elementos DOM
  const el = {
    login: {
      card: document.getElementById("login"),
      btn: document.getElementById("loginBtn"),
      user: document.getElementById("username"),
      pass: document.getElementById("password"),
      error: document.getElementById("loginError")
    },
    vote: {
      card: document.getElementById("voting-area"),
      list: document.getElementById("users-to-vote"),
      count: document.getElementById("pending-count")
    },
    results: {
      card: document.getElementById("results-area"),
      list: document.getElementById("results-list")
    },
    modal: {
      overlay: document.getElementById("emoji-modal"),
      title: document.getElementById("modal-title"),
      grid: document.getElementById("emoji-grid"),
      close: document.getElementById("close-modal")
    }
  };

  let currentTargetUser = null; 

  // --- BANCO DE DADOS ---
  const db = {
    getUsers: () => JSON.parse(localStorage.getItem("qm_users") || "{}"),
    saveUsers: (u) => localStorage.setItem("qm_users", JSON.stringify(u)),
    getVotes: () => JSON.parse(localStorage.getItem("qm_votes_v3") || "{}"), // Mudei para v3 para limpar dados corrompidos
    saveVotes: (v) => localStorage.setItem("qm_votes_v3", JSON.stringify(v))
  };

  // --- 1. LOGIN ---
  el.login.btn.addEventListener("click", () => {
    const user = el.login.user.value.trim();
    const pass = el.login.pass.value.trim();
    
    el.login.error.textContent = "";

    if (!user || pass.length !== 1) {
      el.login.error.textContent = "Preencha o nome e uma senha de 1 caractere.";
      return;
    }

    const users = db.getUsers();

    if (users[user]) {
      // Usuário existe, verifica senha
      if (users[user] !== pass) {
        el.login.error.textContent = "Senha incorreta.";
        return;
      }
    } else {
      // Usuário novo, verifica se senha (caractere) já está em uso
      if (Object.values(users).includes(pass)) {
        el.login.error.textContent = "Este caractere já é a senha de outra pessoa.";
        return;
      }
      users[user] = pass;
      db.saveUsers(users);
    }

    sessionStorage.setItem("qm_logged", user);
    initApp();
  });

  // --- 2. INICIALIZAÇÃO ---
  function initApp() {
    const user = sessionStorage.getItem("qm_logged");
    if (!user) return;

    el.login.card.classList.add("hidden");
    checkVotingStatus();
  }

  // --- 3. FLUXO DE VOTAÇÃO ---
  function checkVotingStatus() {
    const currentUser = sessionStorage.getItem("qm_logged");
    const allUsers = Object.keys(db.getUsers());
    const votes = db.getVotes();
    
    // Garante estrutura básica
    if (!votes[TODAY]) votes[TODAY] = {};
    if (!votes[TODAY][currentUser]) votes[TODAY][currentUser] = {};

    const myVotes = votes[TODAY][currentUser];
    
    // Lista de quem falta votar (exclui eu mesmo e quem já votei)
    const toVote = allUsers.filter(u => u !== currentUser && !myVotes[u]);

    if (toVote.length === 0) {
      showResults();
    } else {
      showVotingList(toVote);
    }
  }

  function showVotingList(pendingUsers) {
    el.vote.card.classList.remove("hidden");
    el.results.card.classList.add("hidden");
    el.vote.list.innerHTML = "";
    
    el.vote.count.textContent = `Faltam ${pendingUsers.length} pessoas para julgar.`;

    pendingUsers.forEach(target => {
      const btn = document.createElement("button");
      btn.className = "user-to-vote-btn"; // Classe estilizada no CSS
      btn.innerHTML = `<span>Votar em <strong>${target}</strong></span> <span>👉</span>`;
      
      // Abre o modal ao clicar
      btn.onclick = () => openModal(target);
      
      el.vote.list.appendChild(btn);
    });
  }

  // --- 4. MODAL E AÇÃO DE VOTAR ---
  function openModal(targetName) {
    currentTargetUser = targetName;
    el.modal.title.textContent = `Defina ${targetName}:`;
    el.modal.grid.innerHTML = "";

    EMOJIS.forEach(emoji => {
      const btn = document.createElement("button");
      btn.textContent = emoji;
      btn.className = "emoji-option"; // Classe estilizada no CSS
      
      // Aqui estava o erro potencial. Agora chamamos uma função segura.
      btn.onclick = (e) => {
        e.stopPropagation(); // Evita cliques duplos indesejados
        confirmVote(emoji);
      };
      
      el.modal.grid.appendChild(btn);
    });

    el.modal.overlay.classList.remove("hidden");
  }

  // Fecha modal ao clicar no botão de fechar ou fora do conteúdo
  el.modal.close.onclick = closeModal;
  
  function closeModal() {
    el.modal.overlay.classList.add("hidden");
    currentTargetUser = null;
  }

  // CORREÇÃO PRINCIPAL AQUI
  function confirmVote(emoji) {
    if (!currentTargetUser) return;

    const currentUser = sessionStorage.getItem("qm_logged");
    const votes = db.getVotes();

    // 1. Cria a data de hoje se não existir
    if (!votes[TODAY]) votes[TODAY] = {};

    // 2. Cria o objeto do usuário atual se não existir
    if (!votes[TODAY][currentUser]) votes[TODAY][currentUser] = {};

    // 3. Salva o voto com segurança
    votes[TODAY][currentUser][currentTargetUser] = emoji;
    db.saveVotes(votes);

    // 4. Fecha e atualiza
    closeModal();
    checkVotingStatus();
  }

  // --- 5. RESULTADOS ---
  function showResults() {
    el.vote.card.classList.add("hidden");
    el.results.card.classList.remove("hidden");
    
    const votesToday = db.getVotes()[TODAY] || {};
    const summary = {}; // Vai guardar: { "Fulano": ["🔥", "❤️"] }

    // Agrega todos os votos recebidos
    Object.values(votesToday).forEach(userVotes => {
      Object.entries(userVotes).forEach(([target, emoji]) => {
        if (!summary[target]) summary[target] = [];
        summary[target].push(emoji);
      });
    });

    el.results.list.innerHTML = "";
    const allUsers = Object.keys(db.getUsers());

    // Se só tem 1 pessoa no sistema, avisa
    if (allUsers.length < 2) {
      el.results.list.innerHTML = "<p>Convide mais amigos para começar a votação!</p>";
      return;
    }

    allUsers.forEach(user => {
      const received = summary[user] || [];
      const div = document.createElement("div");
      div.className = "result-item"; // Classe estilizada no CSS
      
      if (received.length === 0) {
        div.innerHTML = `<strong>${user}</strong>: Aguardando votos...`;
      } else {
        // Conta a frequência dos emojis
        const counts = {};
        received.forEach(e => counts[e] = (counts[e] || 0) + 1);
        
        // Formata para exibir
        const displayString = Object.entries(counts)
          .sort((a, b) => b[1] - a[1]) // Ordena o emoji mais recebido primeiro
          .map(([e, qtd]) => `${e} <small>x${qtd}</small>`)
          .join("&nbsp;&nbsp;");

        div.innerHTML = `<strong>${user}</strong> recebeu: <br> ${displayString}`;
      }
      el.results.list.appendChild(div);
    });
  }

  // Auto-login se der refresh
  if (sessionStorage.getItem("qm_logged")) {
    initApp();
  }
});
