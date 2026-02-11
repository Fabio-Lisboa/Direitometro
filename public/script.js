createElement("div");
div.className const USERS_KEY = "qm_users";
const VOTES_KEY = "qm_votes";
const TODAY = new Date().toISOString().slice(0, 10);


const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");


function getUsers() {
return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}


function saveUsers(users) {
localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


function getVotes() {
return JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
}


function saveVotes(votes) {
localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}


loginBtn.onclick = () => {
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value.trim();


if (!username || password.length !== 1) {
loginError.textContent = "Usuário inválido ou senha precisa ter 1 caractere.";
return;
}


const users = getUsers();


if (!users[username]) {
users[username] = password; // cria usuário novo
saveUsers(users);
} else if (users[username] !== password) {
loginError.textContent = "Senha incorreta.";
return;
}


sessionStorage.setItem("qm_logged", username);
showApp();
};async function vote(to, emoji) {
await fetch("/api/vote", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ from: currentUser, to, emoji })
});


loadResults();
}


async function loadResults() {
const res = await fetch("/api/results");
const data = await res.json();


const container = document.getElementById("results");
container.innerHTML = Object.entries(data)
.map(([user, votes]) => `${user}: ${votes.map(v => v.emoji).join(" ")}`)
.join("<br>");
}container.innerHTML = Object.entries(data)
.map(([user, votes]) => `${user}: ${votes.map(v => v.emoji).join(" ")}`)
.join("<br>");
}


loadUsers();

function showApp() {
loginDiv.classList.add("hidden");
appDiv.classList.remove("hidden");
renderUsers();
renderResults();
}


function renderUsers() {
const users = Object.keys(getUsers());
const list = document.getElementById("users");
list.innerHTML = "";


users.forEach(u => {
const div = document.= "user";


const span = document.createElement("span");
span.textContent = u;


const btn = document.createElement("button");
btn.textContent = "❤️";
btn.className = "emoji-btn";


btn.onclick = () => vote(u);


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
