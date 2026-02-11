import db from "./_db.js";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password || password.length !== 1) {
      return res.status(400).json({ error: "Senha deve ter exatamente 1 caractere" });
    }

    // cria usuário se não existir
    if (!db.users[username]) {
      db.users[username] = { password };
      return res.status(200).json({ created: true });
    }

    // valida login
    if (db.users[username].password === password) {
      return res.status(200).json({ login: true });
    }

    return res.status(401).json({ error: "Senha incorreta" });
  }

  res.status(405).end();
}
