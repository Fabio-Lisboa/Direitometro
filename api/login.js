
import db from "./_db.js";


export default function handler(req, res) {
if (req.method !== "POST") return res.status(405).end();


const { username, password } = req.body;


if (!username || !password || password.length !== 1) {
return res.status(400).json({ error: "Senha deve ter exatamente 1 caractere" });
}


// usuário já existe → apenas valida
if (db.users[username]) {
if (db.users[username].password === password) {
return res.status(200).json({ login: true });
}
return res.status(401).json({ error: "Senha incorreta" });
}


// cria usuário NOVO
db.users[username] = { password };
return res.status(200).json({ created: true });
}
