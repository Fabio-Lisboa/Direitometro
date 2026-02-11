/**
 * Direitômetro - Core Engine
 * Versão Estável para Produção (Vercel Ready)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURAÇÕES E ESTADO ---
  const TODAY = new Date().toISOString().split('T')[0];
  
  const elements = {
    loginBtn: document.getElementById("loginBtn"),
    usernameInput: document.getElementById("username"),
    passwordInput: document.getElementById("password"),
    loginError: document.getElementById("loginError"),
    loginCard: document.getElementById("login"),
    appCard: document.getElementById("app"),
    userList: document.getElementById("users"),
    resultsDiv: document.getElementById("results")
  };

  // --- PERSISTÊNCIA DE DADOS (LocalStorage) ---
  const db = {
    getUsers: () => JSON.parse(localStorage.getItem("qm_users") || "{}"),
    saveUsers: (users) => localStorage.setItem("qm_users", JSON.stringify(users)),
    getVotes: () => JSON.parse(localStorage.getItem("qm_votes") || "{}"),
    saveVotes: (votes) => localStorage.setItem("qm_votes", JSON.stringify(votes))
  };

  // --- CORE FUNCTIONS ---

  function showApp() {
    elements.loginCard.classList.add("hidden");
    elements.appCard.classList.remove("hidden");
    renderUsers();
    renderResults();
  }

  function renderUsers() {
    const users = Object.keys(db.getUsers());
    elements.userList.innerHTML = "";

    users.forEach(user => {
      const div = document.createElement("div");
      div.className = "user-item"; // Ajustado para facilitar CSS futuro
      div.innerHTML = `
        <span>${user}</span>
        <button class="emoji-btn" data-user="${user}">❤️</button>
      `;
      
      div.querySelector('button').onclick = () => castVote(user);
      elements.userList.appendChild(div);
    });
  }

  function castVote(target) {
    const voter = sessionStorage.getItem("qm_logged");
    if (!voter) return;

    const allVotes = db.getVotes();
    if (!allVotes[TODAY]) allVotes[TODAY] = {};

    // Validação de voto único por dia
    if (allVotes[TODAY][voter]) {
      console.warn("Usuário já votou hoje.");
      return;
    }

    allVotes[TODAY][voter] = target;
    db.saveVotes(allVotes);
    renderResults();
  }

  function renderResults() {
    const dayVotes = db.getVotes()[TODAY] || {};
    const tally = {};

    Object.values(dayVotes).forEach(target => {
      tally[target] = (tally[target] || 0) + 1;
    });

    elements.resultsDiv.innerHTML = "";
    Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .forEach(([user, count]) => {
        const p = document.createElement("p");
        p.className = "result-line";
        p.innerHTML = `<strong>${user}</strong>: ${count} ❤️`;
        elements.resultsDiv.appendChild(p);
      });
  }

  // --- HANDLERS ---

  elements.loginBtn.addEventListener("click", () => {
    const user = elements.usernameInput.value.trim();
    const pass = elements.passwordInput.value.trim();

    if (!user || pass.length !== 1) {
      elements.loginError.textContent = "Dados inválidos (Senha deve ter 1 caractere).";
      return;
    }

    const users = db.getUsers();

    // Lógica de Registro/Login Automático
    if (!users[user]) {
      users[user] = pass;
      db.saveUsers(users);
    } else if (users[user] !== pass) {
      elements.loginError.textContent = "Senha incorreta para este usuário.";
      return;
    }

    sessionStorage.setItem("qm_logged", user);
    showApp();
  });

  // --- INITIAL CHECK ---
  if (sessionStorage.getItem("qm_logged")) {
    showApp();
  }
});
