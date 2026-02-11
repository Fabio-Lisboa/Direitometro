let currentUser = null;
const emojis = ["❤️", "😡", "😂", "😴", "🤡"];


async function login() {
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value.trim();


if (!username || !password) {
alert("Preencha usuário e senha");
return;
}


const res = await fetch("/api/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, password })
});


const data = await res.json().catch(() => ({}));


if (!res.ok) {
alert(data.error || "Erro no login");
return;
}


currentUser = username;


document.getElementById("login").style.display = "none";
document.getElementById("app").style.display = "block";


renderUsers();
loadResults();
}


async function renderUsers() {
const res = await fetch("/api/users");
const users = await res.json();


const container = document.getElementById("users");
container.innerHTML = "";


users.filter(u => u !== currentUser).forEach(user => {
const div = document.createElement("div");
div.className = "user";


emojis.forEach(emoji => {
const btn = document.createElement("button");
btn.textContent = `${emoji} → ${user}`;
btn.className = "emoji-btn";
btn.onclick = () => vote(user, emoji);
div.appendChild(btn);
});


container.appendChild(div);
});
}


async function vote(to, emoji) {
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
