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
    header: {
      bar: document.getElementById("app-header"),
      msg: document.getElementById("welcome-msg"),
      btn: document.getElementById("settings-btn")
    },
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
      list: document.getElementById("results-list"),
      refreshBtn: document.getElementById("refresh-btn"),
      logoutBtn: document.getElementById("logout-btn")
    },
    modal: {
      overlay: document.getElementById("emoji-modal"),
      title: document.getElementById("modal-title"),
      grid: document.getElementById("emoji-grid"),
      close: document.getElementById("close-modal")
    },
    settings: {
      overlay: document.getElementById("settings-modal"),
      newPass: document.getElementById("new-password"),
      saveBtn: document.getElementById("save-pass-btn"),
      deleteBtn: document.getElementById("delete-account-btn"),
      closeBtn: document.getElementById("close-settings")
    }
  };

  let currentTargetUser = null; 

  // --- BANCO DE DADOS ---
  const db = {
    getUsers: () => JSON.parse(localStorage.getItem("qm_users") || "{}"),
    saveUsers: (u) => localStorage.setItem("qm_users", JSON.stringify(u)),
    getVotes: () => JSON.parse(localStorage.getItem("qm_votes_v3") || "{}"), 
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
      if (users[user] !== pass) {
        el.login.error.textContent = "Senha incorreta.";
        return;
      }
    } else {
      if (Object.values(users).includes(pass)) {
        el.login.error.textContent = "Caractere já em uso por outra pessoa.";
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
    if (!user) {
      el.header.bar.classList.add("hidden");
      return;
    }

    el.login.card.classList.add("hidden");
    el.header.bar.classList.remove("hidden");
    el.header.msg.textContent = `Olá, ${user}`;
    
    checkVotingStatus();
  }

  // --- 3. FLUXO DE VOTAÇÃO ---
  function checkVotingStatus() {
    const currentUser = sessionStorage.getItem("qm_logged");
    if(!currentUser) return; // Segurança extra

    const allUsers = Object.keys(db.getUsers());
    const votes = db.getVotes();
    
    if (!votes[TODAY]) votes[TODAY] = {};
    if (!votes[TODAY][currentUser]) votes[TODAY][currentUser] = {};

    const myVotes = votes[TODAY][currentUser];
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
      btn.className = "user-to-vote-btn"; 
      btn.innerHTML = `<span>Votar em <strong>${target}</strong></span> <span>👉</span>`;
      btn.onclick = () => openModal(target);
      el.vote.list.appendChild(btn);
    });
  }

  // --- 4. MODAL EMOJI ---
  function openModal(targetName) {
    currentTargetUser = targetName;
    el.modal.title.textContent = `Defina ${targetName}:`;
    el.modal.grid.innerHTML = "";

    EMOJIS.forEach(emoji => {
      const btn = document.createElement("button");
      btn.textContent = emoji;
      btn.className = "emoji-option"; 
      btn.onclick = (e) => {
        e.stopPropagation(); 
        confirmVote(emoji);
      };
      el.modal.grid.appendChild(btn);
    });

    el.modal.overlay.classList.remove("hidden");
  }

  el.modal.close.onclick = () => {
    el.modal.overlay.classList.add("hidden");
    currentTargetUser = null;
  }

  function confirmVote(emoji) {
    if (!currentTargetUser) return;
    const currentUser = sessionStorage.getItem("qm_logged");
    const votes = db.getVotes();

    if (!votes[TODAY]) votes[TODAY] = {};
    if (!votes[TODAY][currentUser]) votes[TODAY][currentUser] = {};

    votes[TODAY][currentUser][currentTargetUser] = emoji;
    db.saveVotes(votes);

    el.modal.overlay.classList.add("hidden");
    currentTargetUser = null;
    checkVotingStatus();
  }

  // --- 5. RESULTADOS E BOTÕES ---
  function showResults() {
    el.vote.card.classList.add("hidden");
    el.results.card.classList.remove("hidden");
    
    const votesToday = db.getVotes()[TODAY] || {};
    const summary = {}; 

    Object.values(votesToday).forEach(userVotes => {
      Object.entries(userVotes).forEach(([target, emoji]) => {
        if (!summary[target]) summary[target] = [];
        summary[target].push(emoji);
      });
    });

    el.results.list.innerHTML = "";
    const allUsers = Object.keys(db.getUsers());

    if (allUsers.length < 2) {
      el.results.list.innerHTML = "<p>Convide mais amigos para começar!</p>";
      return;
    }

    allUsers.forEach(user => {
      const received = summary[user] || [];
      const div = document.createElement("div");
      div.className = "result-item"; 
      
      if (received.length === 0) {
        div.innerHTML = `<strong>${user}</strong>: Aguardando votos...`;
      } else {
        const counts = {};
        received.forEach(e => counts[e] = (counts[e] || 0) + 1);
        
        const displayString = Object.entries(counts)
          .sort((a, b) => b[1] - a[1]) 
          .map(([e, qtd]) => `${e} <small>x${qtd}</small>`)
          .join("&nbsp;&nbsp;");

        div.innerHTML = `<strong>${user}</strong> recebeu: <br> ${displayString}`;
      }
      el.results.list.appendChild(div);
    });
  }

  // AÇÕES FINAIS (REFRESH / LOGOUT)
  el.results.refreshBtn.onclick = () => location.reload();
  
  el.results.logoutBtn.onclick = () => {
    sessionStorage.removeItem("qm_logged");
    location.reload();
  };

  // --- 6. CONFIGURAÇÕES DE PERFIL ---
  el.header.btn.onclick = () => {
    el.settings.overlay.classList.remove("hidden");
  };

  el.settings.closeBtn.onclick = () => {
    el.settings.overlay.classList.add("hidden");
  };

  // Alterar Senha
  el.settings.saveBtn.onclick = () => {
    const currentUser = sessionStorage.getItem("qm_logged");
    const newPass = el.settings.newPass.value.trim();
    const users = db.getUsers();

    if (newPass.length !== 1) {
      alert("A senha deve ter 1 caractere.");
      return;
    }

    // Verifica se a nova senha já é usada por OUTRA pessoa
    const passTaken = Object.entries(users).some(([u, p]) => p === newPass && u !== currentUser);
    
    if (passTaken) {
      alert("Este caractere já está em uso.");
      return;
    }

    users[currentUser] = newPass;
    db.saveUsers(users);
    alert("Senha alterada com sucesso!");
    el.settings.newPass.value = "";
    el.settings.overlay.classList.add("hidden");
  };

  // Excluir Conta
  el.settings.deleteBtn.onclick = () => {
    const currentUser = sessionStorage.getItem("qm_logged");
    if (confirm(`Tem certeza que deseja excluir a conta de ${currentUser}? Isso não pode ser desfeito.`)) {
      const users = db.getUsers();
      delete users[currentUser];
      db.saveUsers(users);
      
      sessionStorage.removeItem("qm_logged");
      location.reload();
    }
  };

  // Auto-login
  if (sessionStorage.getItem("qm_logged")) {
    initApp();
  }
});
