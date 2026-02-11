/**
 * DIREITÔMETRO - Core Logic
 * Versão: Production Ready (Vercel)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURAÇÕES GERAIS ---
  const TODAY = new Date().toISOString().split('T')[0];

  // Top 50 Emojis mais usados (Unicode Consortium) + Variados
  const EMOJIS = [
    "😂","❤️","🤣","👍","😭","🙏","😘","🥰","😍","😊",
    "🎉","😁","💕","🥺","😅","🔥","☺️","🤦","♥️","🤷",
    "🙄","😆","🤗","😉","🎂","🤔","👏","🙂","😳","🥳",
    "😎","👌","💜","😔","💪","✨","💖","👀","😋","😏",
    "😢","👉","💗","😩","💯","🌹","💞","🎈","💙","😃"
  ];

  // --- REFERÊNCIAS DO DOM ---
  const el = {
    loginBtn: document.getElementById("loginBtn"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    loginError: document.getElementById("loginError"),
    loginCard: document.getElementById("login"),
    appCard: document.getElementById("app"),
    userList: document.getElementById("users"),
    results: document.getElementById("results")
  };

  // --- CAMADA DE DADOS (LOCALSTORAGE) ---
  const db = {
    getUsers: () => JSON.parse(localStorage.getItem("qm_users") || "{}"),
    saveUsers: (data) => localStorage.setItem("qm_users", JSON.stringify(data)),
    getVotes: () => JSON.parse(localStorage.getItem("qm_votes") || "{}"),
    saveVotes: (data) => localStorage.setItem("qm_votes", JSON.stringify(data)),
  };

  // --- LÓGICA DE LOGIN E SEGURANÇA ---
  el.loginBtn.addEventListener("click", () => {
    const user = el.username.value.trim();
    const pass = el.password.value.trim();
    
    // Limpa erros anteriores
    el.loginError.textContent = "";

    // 1. Validação Básica
    if (!user) {
      el.loginError.textContent = "Por favor, digite um nome de usuário.";
      return;
    }
    if (pass.length !== 1) {
      el.loginError.textContent = "A senha deve ter exatamente 1 caractere.";
      return;
    }

    const users = db.getUsers();

    // 2. Verifica se o USUÁRIO já existe
    if (users[user]) {
      // Se existe, a senha TEM que bater
      if (users[user] !== pass) {
        el.loginError.textContent = "Senha incorreta."; // Regra: Se errar a senha da conta existente
        return;
      }
      // Login com sucesso (usuário recorrente)
      loginSuccess(user);
    } 
    else {
      // 3. Verifica se a SENHA (Caractere) já está em uso por OUTRA pessoa
      const passwordsInUse = Object.values(users);
      if (passwordsInUse.includes(pass)) {
        el.loginError.textContent = "Caractere indisponível."; // Regra: Senha única no sistema
        return;
      }

      // 4. Criação de Novo Usuário
      users[user] = pass;
      db.saveUsers(users);
      loginSuccess(user);
    }
  });

  function loginSuccess(username) {
    sessionStorage.setItem("qm_logged", username);
    showApp();
  }

  // --- LÓGICA DE EXIBIÇÃO ---
  function showApp() {
    el.loginCard.classList.add("hidden");
    el.appCard.classList.remove("hidden");
    renderVotingList();
    renderResults();
  }

  function renderVotingList() {
    const users = Object.keys(db.getUsers());
    const currentUser = sessionStorage.getItem("qm_logged");
    
    el.userList.innerHTML = "";

    users.forEach(u => {
      // Opcional: Não mostrar o próprio usuário na lista de votação (auto-voto)
      // Se quiser permitir auto-voto, remova o if abaixo.
      if (u === currentUser) return; 

      const card = document.createElement("div");
      card.className = "user-card";

      // Cabeçalho do Card
      const nameTitle = document.createElement("h3");
      nameTitle.textContent = u;
      card.appendChild(nameTitle);

      // Container de Emojis
      const emojiContainer = document.createElement("div");
      emojiContainer.className = "emoji-grid"; // Classe para o CSS grid

      EMOJIS.forEach(emoji => {
        const btn = document.createElement("button");
        btn.textContent = emoji;
        btn.className = "emoji-btn";
        btn.onclick = () => handleVote(u, emoji);
        emojiContainer.appendChild(btn);
      });

      card.appendChild(emojiContainer);
      el.userList.appendChild(card);
    });
  }

  // --- LÓGICA DE VOTAÇÃO ---
  window.handleVote = (targetUser, emoji) => {
    const currentUser = sessionStorage.getItem("qm_logged");
    if (!currentUser) return;

    const votes = db.getVotes();
    if (!votes[TODAY]) votes[TODAY] = {};

    // Verifica se já votou hoje
    if (votes[TODAY][currentUser]) {
      // Feedback visual simples ou console (sem alert intrusivo)
      console.warn("Você já votou hoje.");
      return;
    }

    // Registra o voto: Quem votou -> Em quem -> Qual Emoji
    votes[TODAY][currentUser] = { target: targetUser, emoji: emoji };
    db.saveVotes(votes);
    
    // Atualiza a tela de resultados imediatamente
    renderResults();
  };

  function renderResults() {
    const votesToday = db.getVotes()[TODAY] || {};
    const tally = {};

    // Contabiliza: "Fulano ganhou tal emoji X vezes"
    Object.values(votesToday).forEach(vote => {
      const key = `${vote.target}|${vote.emoji}`; // Chave composta
      tally[key] = (tally[key] || 0) + 1;
    });

    el.results.innerHTML = "";
    
    // Ordena do mais votado para o menos votado
    const sortedResults = Object.entries(tally).sort((a, b) => b[1] - a[1]);

    if (sortedResults.length === 0) {
      el.results.innerHTML = "<p>Nenhum voto computado hoje ainda.</p>";
      return;
    }

    sortedResults.forEach(([key, count]) => {
      const [target, emoji] = key.split("|");
      const p = document.createElement("p");
      p.className = "result-item";
      p.innerHTML = `<strong>${target}</strong> recebeu ${count} x ${emoji}`;
      el.results.appendChild(p);
    });
  }

  // --- AUTO LOGIN (SESSÃO) ---
  if (sessionStorage.getItem("qm_logged")) {
    showApp();
  }
});
