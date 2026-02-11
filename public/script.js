document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURAÇÕES ---
  const TODAY = new Date().toISOString().split('T')[0];
  // CREDENCIAIS DO ADMIN (Hardcoded)
  const ADMIN_USER = "ADMIN";
  const ADMIN_PASS = "#";

  const EMOJIS = [
    "😂","❤️","🤣","👍","😭","🙏","😘","🥰","😍","😊",
    "🎉","😁","💕","🥺","😅","🔥","☺️","🤦","♥️","🤷",
    "🙄","😆","🤗","😉","🎂","🤔","👏","🙂","😳","🥳",
    "😎","👌","💜","😔","💪","✨","💖","👀","😋","😏",
    "😢","👉","💗","😩","💯","🌹","💞","🎈","💙","😃"
  ];

  // --- ELEMENTOS DOM ---
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
      title: document.getElementById("settings-title"),
      normalArea: document.getElementById("normal-user-settings"),
      adminArea: document.getElementById("admin-user-list"),
      newPass: document.getElementById("new-password"),
      saveBtn: document.getElementById("save-pass-btn"),
      deleteBtn: document.getElementById("delete-account-btn"),
      closeBtn: document.getElementById("close-settings")
    }
  };

  let currentTargetUser = null; 

  // --- BANCO DE DADOS ---
  // Usando 'v4' para garantir que o Admin não pegue lixo de testes anteriores
  const DB_KEY_USERS = "qm_users_v4";
  const DB_KEY_VOTES = "qm_votes_v4";

  const db = {
    getUsers: () => JSON.parse(localStorage.getItem(DB_KEY_USERS) || "{}"),
    saveUsers: (u) => localStorage.setItem(DB_KEY_USERS, JSON.stringify(u)),
    getVotes: () => JSON.parse(localStorage.getItem(DB_KEY_VOTES) || "{}"),
    saveVotes: (v) => localStorage.setItem(DB_KEY_VOTES, JSON.stringify(v))
  };

  // --- 1. LOGIN ---
  el.login.btn.addEventListener("click", () => {
    const user = el.login.user.value.trim();
    const pass = el.login.pass.value.trim();
    el.login.error.textContent = "";

    if (!user || pass.length !== 1) {
      el.login.error.textContent = "Nome e senha de 1 caractere obrigatórios.";
      return;
    }

    // BACKDOOR DO ADMIN
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem("qm_logged", ADMIN_USER);
      initApp();
      return;
    }

    const users = db.getUsers();

    if (users[user]) {
      if (users[user] !== pass) {
        el.login.error.textContent = "Senha incorreta.";
        return;
      }
    } else {
      // Impede criar usuário com nome "ADMIN"
      if (user.toUpperCase() === ADMIN_USER) {
        el.login.error.textContent = "Nome de usuário reservado.";
        return;
      }
      // Verifica se senha já está em uso
      if (Object.values(users).includes(pass)) {
        el.login.error.textContent = "Caractere já em uso.";
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
    
    // Mensagem especial para o Admin
    if (user === ADMIN_USER) {
      el.header.msg.innerHTML = "⚡ Modo Admin";
      showResults(); // Admin vai direto para resultados
    } else {
      el.header.msg.textContent = `Olá, ${user}`;
      checkVotingStatus();
    }
  }

  // --- 3. FLUXO DE VOTAÇÃO (Normal Users) ---
  function checkVotingStatus() {
    const currentUser = sessionStorage.getItem("qm_logged");
    if(currentUser === ADMIN_USER) return;

    const allUsers = Object.keys(db.getUsers());
    const votes = db.getVotes();
    
    if (!votes[TODAY]) votes[TODAY] = {};
    if (!votes[TODAY][currentUser]) votes[TODAY][currentUser] = {};

    const myVotes = votes[TODAY][currentUser];
    // Remove Admin da lista de votação se ele existir no banco
    const toVote = allUsers.filter(u => u !== currentUser && u !== ADMIN_USER && !myVotes[u]);

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
    el.vote.count.textContent = `Faltam ${pendingUsers.length} para julgar.`;

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
      btn.onclick = (e) => { e.stopPropagation(); confirmVote(emoji); };
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

  // --- 5. RESULTADOS ---
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
    // Filtra o Admin da lista de resultados
    const allUsers = Object.keys(db.getUsers()).filter(u => u !== ADMIN_USER);

    if (allUsers.length === 0) {
       // Mensagem diferente se for admin ou usuário comum
       if (sessionStorage.getItem("qm_logged") === ADMIN_USER) {
         el.results.list.innerHTML = "<p>Nenhum usuário cadastrado ainda.</p>";
       } else {
         el.results.list.innerHTML = "<p>Aguardando outros participantes.</p>";
       }
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

  // AÇÕES GERAIS
  el.results.refreshBtn.onclick = () => location.reload();
  el.results.logoutBtn.onclick = () => {
    sessionStorage.removeItem("qm_logged");
    location.reload();
  };

  // --- 6. CONFIGURAÇÕES & ÁREA ADMIN ---
  el.header.btn.onclick = () => {
    const currentUser = sessionStorage.getItem("qm_logged");
    
    if (currentUser === ADMIN_USER) {
      // SE FOR ADMIN: Mostra lista de exclusão
      el.settings.title.textContent = "Administração de Usuários";
      el.settings.normalArea.classList.add("hidden");
      el.settings.adminArea.classList.remove("hidden");
      renderAdminUserList();
    } else {
      // SE FOR NORMAL: Mostra opções de perfil
      el.settings.title.textContent = "Gerenciar Perfil";
      el.settings.normalArea.classList.remove("hidden");
      el.settings.adminArea.classList.add("hidden");
    }
    el.settings.overlay.classList.remove("hidden");
  };

  el.settings.closeBtn.onclick = () => {
    el.settings.overlay.classList.add("hidden");
  };

  // --- FUNÇÕES ADMIN ---
  function renderAdminUserList() {
    const users = db.getUsers();
    const userNames = Object.keys(users);
    el.settings.adminArea.innerHTML = "";

    if (userNames.length === 0) {
      el.settings.adminArea.innerHTML = "<p>Nenhum usuário para excluir.</p>";
      return;
    }

    userNames.forEach(user => {
      // Não permite excluir o próprio Admin se ele estiver no banco (segurança)
      if(user === ADMIN_USER) return; 

      const div = document.createElement("div");
      div.className = "admin-user-item";
      div.innerHTML = `
        <span>👤 ${user} (Senha: ${users[user]})</span>
        <button class="danger-btn admin-delete-btn">🗑️ Excluir</button>
      `;

      // Ação de Excluir
      div.querySelector(".admin-delete-btn").onclick = () => {
        if(confirm(`Tem certeza que deseja banir "${user}"?`)) {
          delete users[user];
          db.saveUsers(users);
          renderAdminUserList(); // Atualiza a lista
          // Opcional: Limpar votos relacionados a esse usuário (mais complexo, deixei simples por enquanto)
        }
      };
      el.settings.adminArea.appendChild(div);
    });
  }


  // --- FUNÇÕES USUÁRIO NORMAL (Alterar/Excluir) ---
  el.settings.saveBtn.onclick = () => {
    const currentUser = sessionStorage.getItem("qm_logged");
    const newPass = el.settings.newPass.value.trim();
    const users = db.getUsers();

    if (newPass.length !== 1) { alert("A senha deve ter 1 caractere."); return; }
    const passTaken = Object.entries(users).some(([u, p]) => p === newPass && u !== currentUser);
    if (passTaken) { alert("Caractere já em uso."); return; }

    users[currentUser] = newPass;
    db.saveUsers(users);
    alert("Senha alterada!");
    el.settings.newPass.value = "";
    el.settings.overlay.classList.add("hidden");
  };

  el.settings.deleteBtn.onclick = () => {
    const currentUser = sessionStorage.getItem("qm_logged");
    if (confirm(`Excluir sua conta "${currentUser}" permanentemente?`)) {
      const users = db.getUsers();
      delete users[currentUser];
      db.saveUsers(users);
      sessionStorage.removeItem("qm_logged");
      location.reload();
    }
  };

  // Auto-login
  if (sessionStorage.getItem("qm_logged")) { initApp(); }
});
