const USERS_KEY = "qm_users";
}


const users = getUsers();


// limite de usuários
if (!users[username] && Object.keys(users).length >= MAX_USERS) {
loginError.textContent = "Limite máximo de 10 usuários atingido.";
return;
}


// usuário já existe → erro (não cria de novo)
if (users[username] && users[username] !== password) {
loginError.textContent = "Usuário já existe com outra senha.";
return;
}


// senha já usada por outro colega → erro
const passwordInUse = Object.entries(users).some(
([u, p]) => p === password && u !== username
);


if (passwordInUse) {
loginError.textContent = "Esse caractere já está sendo usado por outro usuário.";
return;
}


// cria usuário se não existir
if (!users[username]) {
users[username] = password;
saveUsers(users);
}


sessionStorage.setItem("qm_logged", username);
showApp();
});


function renderUsers() {
const users = Object.keys(getUsers());
const list = document.getElementById("users");
list.innerHTML = "";


const emojis = [
"❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💖","💔",
"😊","😂","🤣","😍","🥰","😘","😎","🤩","🥳","😴","🤯","😇","😈","💀","🤡",
"😡","🤬","😭","😢","😤","😱","😨","😰","😬","🙄","🤔",
"👏","🙌","👍","👎","✌️","🤝","🙏","💪","🔥","✨","🌟","⚡",
"🎉","🎊","🏆","🥇","🥈","🥉","🎮","🎵","🎶","📚","💻","📱",
"🍕","🍔","🍟","🍿","🍩","🍫","🍪","☕","🍺","🍹","🍎","🍉",
"🐶","🐱","🐸","🐼","🦊","🐵","🦁","🐯","🐨","🐷","🐮","🐔"
];


users.forEach(u => {
const div = document.createElement("div");
div.className = "user";


const span = document.createElement("span");
span.textContent = u;


const emojiContainer = document.createElement("div");


emojis.forEach(e => {
const btn = document.createElement("button");
btn.textContent = e;
btn.className = "emoji-btn";
btn.addEventListener("click", () => vote(u, e));
emojiContainer.appendChild(btn);
});


div.appendChild(span);
div.appendChild(emojiContainer);
list.appendChild(div);
});
}


function vote(target, emoji) {
const username = sessionStorage.getItem("qm_logged");
if (!username) return;


const votes = getVotes();
if (!votes[TODAY]) votes[TODAY] = {};


if (votes[TODAY][username]) return;


votes[TODAY][username] = { target, emoji };
saveVotes(votes);


renderResults();
}


function renderResults() {
const votes = getVotes()[TODAY] || {};
const count = {};


Object.values(votes).forEach(v => {
const key = `${v.target}_${v.emoji}`;
count[key] = (count[key] || 0) + 1;
});


const resultsDiv = document.getElementById("results");
resultsDiv.innerHTML = "";


Object.entries(count)
.sort((a, b) => b[1] - a[1])
.forEach(([key, total]) => {
const [user, emoji] = key.split("_");
const p = document.createElement("p");
p.textContent = `${user} ${emoji} : ${total}`;
resultsDiv.appendChild(p);
});
}


if (sessionStorage.getItem("qm_logged")) {
showApp();
}
});});


const resultsDiv = document.getElementById("results");
resultsDiv.innerHTML = "";


Object.entries(count)
.sort((a, b) => b[1] - a[1])
.forEach(([key, total]) => {
const [user, emoji] = key.split("_");
const p = document.createElement("p");
p.textContent = `${user} ${emoji} : ${total}`;
resultsDiv.appendChild(p);
});
}


if (sessionStorage.getItem("qm_logged")) {
showApp();
}
});      "🐶","🐱","🐸","🐼","🦊","🐵","🦁","🐯","🐨","🐷","🐮","🐔"
    ];

    users.forEach(u => {
      const div = document.createElement("div");
      div.className = "user";

      const span = document.createElement("span");
      span.textContent = u;

      const emojiContainer = document.createElement("div");

      emojis.forEach(e => {
        const btn = document.createElement("button");
        btn.textContent = e;
        btn.className = "emoji-btn";
        btn.addEventListener("click", () => vote(u, e));
        emojiContainer.appendChild(btn);
      });

      div.appendChild(span);
      div.appendChild(emojiContainer);
      list.appendChild(div);
    });
  }

  function vote(target, emoji)(target) {
    const username = sessionStorage.getItem("qm_logged");
    if (!username) return;

    const votes = getVotes();
    if (!votes[TODAY]) votes[TODAY] = {};

    // impede voto duplicado
    if (votes[TODAY][username]) return;

    votes[TODAY][username] = target;
    saveVotes(votes);

    renderResults();
  }

  function renderResults() {
    const votes = getVotes()[TODAY] || {};
    const count = {};

    Object.values(votes).forEach(v => {
      count[v] = (count[v] || 0) + 1;
    });

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .forEach(([user, total]) => {
        const p = document.createElement("p");
        p.textContent = `${user}: ${total} ❤️`;
        resultsDiv.appendChild(p);
      });
  }

  if (sessionStorage.getItem("qm_logged")) {
    showApp();
  }
});renderResults();
}


loginBtn.addEventListener("click", () => {
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value.trim();


loginError.textContent = "";


if (!username || password.length !== 1) {
loginError.textContent = "Usuário inválido ou senha precisa ter 1 caractere.";
return;
}


const users = getUsers();


// criação única de usuário
if (!users[username]) {
users[username] = password;
saveUsers(users);
} else if (users[username] !== password) {
loginError.textContent = "Senha incorreta.";
return;
}


sessionStorage.setItem("qm_logged", username);
showApp();
});


function renderUsers() {
const users = Object.keys(getUsers());
const list = document.getElementById("users");
list.innerHTML = "";


users.forEach(u => {
const div = document.createElement("div");
div.className = "user";


const span = document.createElement("span");
span.textContent = u;


const btn = document.createElement("button");
btn.textContent = "❤️";
btn.className = "emoji-btn";


btn.addEventListener("click", () => vote(u));


div.appendChild(span);
div.appendChild(btn);
list.appendChild(div);
});
}


function vote(target) {
const username = sessionStorage.getItem("qm_logged");
if (!username) return;


const votes = getVotes();
if (!votes[TODAY]) votes[TODAY] = {};


// impede voto duplicado
if (votes[TODAY][username]) return;


votes[TODAY][username] = target;
saveVotes(votes);


renderResults();
}


function renderResults() {
const votes = getVotes()[TODAY] || {};
const count = {};


Object.values(votes).forEach(v => {
count[v] = (count[v] || 0) + 1;
});


const resultsDiv = document.getElementById("results");
resultsDiv.innerHTML = "";


Object.entries(count)
.sort((a, b) => b[1] - a[1])
.forEach(([user, total]) => {
const p = document.createElement("p");
p.textContent = `${user}: ${total} ❤️`;
resultsDiv.appendChild(p);
});
}


if (sessionStorage.getItem("qm_logged")) {
showApp();
}
});
