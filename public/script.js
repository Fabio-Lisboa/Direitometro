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

  let currentTargetUser = null; // Armazena quem estamos votando no momento

  // --- BANCO DE DADOS ---
  const db = {
    getUsers: () => JSON.parse(localStorage.getItem("qm_users") || "{}"),
    saveUsers: (u) => localStorage.setItem("qm_users", JSON.stringify(u)),
    // ESTRUTURA NOVA DOS VOTOS: { "DATA": { "QUEM_VOTOU": { "ALVO": "EMOJI", "ALVO2": "EMOJI" } } }
    getVotes: () => JSON.parse(localStorage.getItem("qm_votes_v2") || "{}"), 
    saveVotes: (v) => localStorage.setItem("qm_votes_v2", JSON.stringify(v))
  };

  // --- 1. SISTEMA DE LOGIN ---
  el.login.btn.addEventListener("click", () => {
    const user = el.login.user.value.trim();
    const pass = el.login.pass.value.trim();
    
    el.login.error.textContent = "";

    if (!user || pass.length !== 1) {
      el.login.error.textContent = "Nome obrigatório e Senha de 1 caractere.";
      return;
    }

    const users = db.getUsers();

    // Lógica de Segurança (A mesma do passo anterior)
    if (users[user]) {
      if (users[user] !== pass) {
        el.login.error.textContent = "Senha incorreta.";
        return;
      }
    } else {
      if (Object.values(users).includes(pass)) {
        el.login.error.textContent = "Este caractere de senha já pertence a outra pessoa.";
        return;
      }
      users[user] = pass;
      db.saveUsers(users);
    }

    sessionStorage.setItem("qm_logged", user);
    initApp();
  });

  // --- 2. INICIALIZAÇÃO DO APP ---
  function initApp() {
    const user = sessionStorage.getItem("qm_logged");
    if (!user) return;

    el.login.card.classList.add("hidden");
    
    // Verifica status da votação
    checkVotingStatus();
  }

  // --- 3. FLUXO DE VOTAÇÃO ---
  function checkVotingStatus() {
    const currentUser = sessionStorage.getItem("qm_logged");
    const allUsers = Object.keys(db.getUsers());
    const votes = db.getVotes();
    
    // Garante estrutura inicial
    if (!votes[TODAY]) votes[TODAY] = {};
    if (!votes[TODAY][currentUser]) votes[TODAY][currentUser] = {};

    const myVotes = votes[TODAY][currentUser];
    
    // Filtra: Todos os usuários MENOS eu mesmo MENOS quem eu já votei
    const toVote = allUsers.filter(u => u !== currentUser && !myVotes[u]);

    if (toVote.length === 0) {
      // Se não tem ninguém para votar, mostra resultados
      showResults();
    } else {
      // Se tem gente para votar, mostra a lista
      showVotingList(toVote);
    }
  }

  function showVotingList(pendingUsers) {
    el.vote.card.classList.remove("hidden");
    el.results.card.classList.add("hidden");
    el.vote.list.innerHTML = "";
    
    el.vote.count.textContent = `Faltam ${pendingUsers.length} pessoas para votar.`;

    pendingUsers.forEach(target => {
      const btn = document.createElement("button");
      btn.className = "user-to-vote-btn";
      btn.innerHTML = `Votar em <strong>${target}</strong> 👉`;
      
      btn.onclick = () => openModal(target);
      
      el.vote.list.appendChild(btn);
    });
  }

  // --- 4. MODAL E SELEÇÃO ---
  function openModal(targetName) {
    currentTargetUser = targetName;
    el.modal.title.textContent = `Defina ${targetName}:`;
    el.modal.grid.innerHTML = "";

    EMOJIS.forEach(emoji => {
      const btn = document.createElement("button");
      btn.textContent = emoji;
      btn.className = "emoji-option";
      btn.onclick = () => confirmVote(emoji);
      el.modal.grid.appendChild(btn);
    });

    el.modal.overlay.classList.remove("hidden");
  }

  el.modal.close.onclick = () => {
    el.modal.overlay.classList.add("hidden");
    currentTargetUser = null;
  };

  function confirmVote(emoji) {
    if (!currentTargetUser) return;

    const currentUser = sessionStorage.getItem("qm_logged");
    const votes = db.getVotes();

    // Salva o voto específico: Eu -> Alvo -> Emoji
    votes[TODAY][currentUser][currentTargetUser] = emoji;
    db.saveVotes(votes);

    // Fecha modal e verifica se acabou
    el.modal.overlay.classList.add("hidden");
    checkVotingStatus();
  }

  // --- 5. RESULTADOS ---
  function showResults() {
    el.vote.card.classList.add("hidden");
    el.results.card.classList.remove("hidden");
    
    const votesToday = db.getVotes()[TODAY] || {};
    const summary = {};

    // Agrega os resultados: Varrer todos os votos de todos os usuários
    Object.values(votesToday).forEach(userVotes => {
      // userVotes é algo como: { "Pedro": "🔥", "Maria": "😂" }
      Object.entries(userVotes).forEach(([target, emoji]) => {
        if (!summary[target]) summary[target] = [];
        summary[target].push(emoji);
      });
    });

    el.results.list.innerHTML = "";
    const allUsers = Object.keys(db.getUsers());

    if (allUsers.length < 2) {
      el.results.list.innerHTML = "<p>Ainda não há outros participantes.</p>";
      return;
    }

    // Renderiza cada participante e os emojis que recebeu
    allUsers.forEach(user => {
      const received = summary[user] || [];
      const div = document.createElement("div");
      div.className = "result-item";
      
      if (received.length === 0) {
        div.innerHTML = `<strong>${user}</strong> ainda não recebeu votos.`;
      } else {
        // Conta quais emojis foram mais recebidos
        const counts = {};
        received.forEach(e => counts[e] = (counts[e] || 0) + 1);
        
        // Formata a string ex: "🔥(2) 😂(1)"
        const displayString = Object.entries(counts)
          .map(([e, qtd]) => `${e} <small>x${qtd}</small>`)
          .join("  ");

        div.innerHTML = `<strong>${user}</strong>: ${displayString}`;
      }
      el.results.list.appendChild(div);
    });
  }

  // Auto-login ao carregar
  if (sessionStorage.getItem("qm_logged")) {
    initApp();
  }
});
